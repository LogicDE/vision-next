import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'TU_SECRETO_SUPER_SEGURO', // Igual que en JwtModule
    });
  }

  async validate(payload: any) {
    // payload = { sub: usuario_id, email, role }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
