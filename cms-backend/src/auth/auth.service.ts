import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepo: Repository<Employee>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async validateUser(email: string, password: string): Promise<Employee | null> {
    if (!email || !password) {
      throw new UnauthorizedException('Email y contraseña son requeridos');
    }

    const employee = await this.employeesRepo.findOne({
      where: { email },
      relations: ['rol'],
    });

    if (employee && (await bcrypt.compare(password, employee.password_hash))) {
      return employee;
    }
    return null;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const employee = await this.validateUser(email, password);
    if (!employee) throw new UnauthorizedException('Credenciales inválidas');

    // Generar JTI
    const jtiAccess = uuidv4();
    const jtiRefresh = uuidv4();

    // Payloads
    const payloadAccess = { sub: employee.id_employee, email: employee.email, role: employee.rol.name, jti: jtiAccess };
    const payloadRefresh = { sub: employee.id_employee, email: employee.email, role: employee.rol.name, jti: jtiRefresh };

    const access_token = this.jwtService.sign(payloadAccess, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '5m',
    });

    const refresh_token = this.jwtService.sign(payloadRefresh, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Guardar en Redis
    const accessTTL = 60 * 5; // 5 min
    const refreshTTL = 60 * 60 * 24 * 7; // 7 días

    await this.redisService.set(`jwt:allow:${jtiAccess}`, 1, accessTTL);
    await this.redisService.set(`jwt:allow:${jtiRefresh}`, 1, refreshTTL);

    await this.redisService.sadd(`jwt:active:${employee.id_employee}`, jtiAccess);
    await this.redisService.sadd(`jwt:active:${employee.id_employee}`, jtiRefresh);

    await this.redisService.set(`jwt:meta:${jtiAccess}`, { user_id: employee.id_employee, type: 'access', exp: Date.now() + accessTTL * 1000 }, accessTTL);
    await this.redisService.set(`jwt:meta:${jtiRefresh}`, { user_id: employee.id_employee, type: 'refresh', exp: Date.now() + refreshTTL * 1000 }, refreshTTL);

    return {
      access_token,
      refresh_token,
      user: {
        id: employee.id_employee,
        nombre: `${employee.first_name} ${employee.last_name}`,
        email: employee.email,
        rol: employee.rol.name,
      },
    };
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      const payload: any = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_REFRESH_SECRET') });

      // Verificar que refresh token esté en allow-list
      const allowed = await this.redisService.get(`jwt:allow:${payload.jti}`);
      if (!allowed) throw new UnauthorizedException('Refresh token inválido');

      // Nuevo access token
      const jtiAccess = uuidv4();
      const access_token = this.jwtService.sign({ sub: payload.sub, email: payload.email, role: payload.role, jti: jtiAccess }, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '5m',
      });

      const accessTTL = 60 * 5;
      await this.redisService.set(`jwt:allow:${jtiAccess}`, 1, accessTTL);
      await this.redisService.sadd(`jwt:active:${payload.sub}`, jtiAccess);
      await this.redisService.set(`jwt:meta:${jtiAccess}`, { user_id: payload.sub, type: 'access', exp: Date.now() + accessTTL * 1000 }, accessTTL);

      return { access_token };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(userId: number, jti: string, exp?: number) {
    await this.redisService.srem(`jwt:active:${userId}`, jti);
    await this.redisService.del(`jwt:allow:${jti}`);

    const ttl = exp ? Math.max(Math.floor((exp * 1000 - Date.now()) / 1000), 0) : 3600;
    await this.redisService.set(`jwt:denylist:${jti}`, 1, ttl);
  }


  async logoutAll(userId: number) {
    const activeTokens = await this.redisService.smembers(`jwt:active:${userId}`);
    for (const jti of activeTokens) {
      await this.redisService.del(`jwt:allow:${jti}`);
      await this.redisService.set(`jwt:denylist:${jti}`, 1, 3600); // 1 hora en denylist
    }
    await this.redisService.del(`jwt:active:${userId}`);
  }
}
