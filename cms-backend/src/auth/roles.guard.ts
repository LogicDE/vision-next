import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true; // no role required

    const req = context.switchToHttp().getRequest();
    const user = req.user ?? (req as any).user; // JwtRedisGuard attaches payload to req.user

    if (!user) throw new ForbiddenException('No user found in request');

    // 🔹 Si es una llamada interna entre microservicios → acceso directo
    if (user.isInternal) {
      return true;
    }

    const has = requiredRoles.includes(user.role);
    if (!has) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
