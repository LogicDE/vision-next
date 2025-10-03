import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRedisGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.cookies['jwt'];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload: any = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Verificar denylist
      const isDenied = await this.redisService.get(`jwt:denylist:${payload.jti}`);
      if (isDenied) throw new UnauthorizedException('Token revoked');

      // Verificar allowlist
      const isAllowed = await this.redisService.get(`jwt:allow:${payload.jti}`);
      if (!isAllowed) throw new UnauthorizedException('Token expired or invalid');

      // Adjuntar payload a la request
      (req as any).user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
