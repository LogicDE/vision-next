import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string; // ahora es solo el nombre del rol
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Valida si el usuario y contraseña son correctos
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({
      where: { email },
      relations: ['rol'], // traer el rol para poder usar user.rol.nombre
    });
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }
    return null;
  }

  // Login seguro con JWT
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.usuario_id, email: user.email, role: user.rol.nombre };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.usuario_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol.nombre,
      },
    };
  }
}
