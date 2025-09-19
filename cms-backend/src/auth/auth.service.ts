import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
  ) {}

  async validateUser(email: string, password: string): Promise<Employee | null> {
    const employee = await this.employeesRepo.findOne({
      where: { email },
      relations: ['rol'],
    });

    if (employee && (await bcrypt.compare(password, employee.passwordHash))) {
      return employee;
    }
    return null;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const employee = await this.validateUser(email, password);
    if (!employee) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: employee.id, email: employee.email, role: employee.rol.name };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: employee.id,
        nombre: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        rol: employee.rol.name,
      },
    };
  }

  // Verifica refresh token y genera nuevo access token
  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, role: payload.role },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      );
      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
