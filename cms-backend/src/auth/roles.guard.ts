import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<string[]>(ROLES_KEY, context.getHandler()) ??
      this.reflector.get<string[]>(ROLES_KEY, context.getClass());
    if (!requiredRoles || requiredRoles.length === 0) return true; // no role required

    const req = context.switchToHttp().getRequest();
    const user = req.user ?? (req as any).user; // JwtRedisGuard attaches payload to req.user

    if (!user) throw new ForbiddenException('No user found in request');

    // 🔹 Si es una llamada interna entre microservicios → acceso directo
    if (user.isInternal) {
      return true;
    }

    const rawRole = user.role ?? user.rol ?? user.Rol ?? '';
    const normalizedRole = `${rawRole}`.toLowerCase().trim();
    const normalizedRequired = requiredRoles.map((role) => role.toLowerCase().trim());
    const has = normalizedRequired.includes(normalizedRole);
    if (!has) {
      console.log('RolesGuard deny', {
        requiredRoles,
        normalizedRequired,
        userRole: user.role,
        normalizedRole,
        path: req?.url,
        method: req?.method,
      });
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
