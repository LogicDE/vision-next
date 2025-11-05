import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRedisGuard implements CanActivate {
  private readonly logger = new Logger(JwtRedisGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    // 1️⃣ Extraer token desde cookie o header
    const cookieToken = req.cookies?.['jwt'];
    const authHeader = req.headers['authorization'] as string | undefined;
    
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader ?? null;

    const token = cookieToken || headerToken;

    if (!token) {
      this.logger.warn('Intento de acceso sin token');
      throw new UnauthorizedException('No token provided');
    }

    // 2️⃣ Permitir token interno entre microservicios
    const internalToken = this.configService.get<string>('INTERNAL_SERVICE_JWT');
    if (internalToken && token === internalToken) {
      this.logger.debug('Token interno válido — acceso autorizado entre microservicios');

       // 🔹 Simulacion usuario interno para que RolesGuard no falle
      (req as any).user = {
        id: 'internal',
        role: 'System',
        name: 'InternalService',
        isInternal: true,  // <-- marca interna
    };
      return true;
    }

    try {
      // 3️⃣ Verificar JWT
      const payload: any = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!payload.jti) {
        this.logger.error(`Token sin JTI (único ID): user=${payload.sub}`);
        throw new UnauthorizedException('Token sin identificador único (jti)');
      }

      // 4️⃣ Verificar denylist
      const isDenied = await this.redisService.get(`jwt:denylist:${payload.jti}`);
      if (isDenied) {
        this.logger.warn(`Token revocado detectado: jti=${payload.jti}`);
        throw new UnauthorizedException('Token revocado');
      }

      // 5️⃣ Verificar allowlist
      const isAllowed = await this.redisService.get(`jwt:allow:${payload.jti}`);
      if (!isAllowed) {
        this.logger.warn(`Token expirado o ausente en allowlist: jti=${payload.jti}`);
        throw new UnauthorizedException('Token expirado o inválido');
      }

      // 6️⃣ Adjuntar usuario al request
      (req as any).user = payload;

      // 7️⃣ Log opcional de auditoría
      this.logger.debug(`Acceso autorizado: user=${payload.sub}, jti=${payload.jti}`);

      return true;
    } catch (err) {
      // ✅ Manejo seguro de errores con tipado correcto
      if (err instanceof Error) {
        this.logger.error(`Error verificando token: ${err.message}`);
      } else {
        this.logger.error(`Error desconocido verificando token: ${JSON.stringify(err)}`);
      }

      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
