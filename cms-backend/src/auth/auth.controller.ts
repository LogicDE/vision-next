  import { Controller, Post, Body, Res, Get, Req, HttpException, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { Response, Request } from 'express';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { JwtRedisGuard } from './jwt-redis.guard';
  import { getProfilePictureSignedUrl } from '../utils/gcpStorage';

  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService, private jwtService: JwtService, private configService: ConfigService) {}

    private getCookieOptions(ttlMs: number) {
      return {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'strict' as const,
        maxAge: ttlMs,
      };
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
      const loginResponse = await this.authService.login(body.email, body.password);

      res.cookie('jwt', loginResponse.access_token, this.getCookieOptions(1000 * 60 * 5));
      res.cookie('refresh_jwt', loginResponse.refresh_token, this.getCookieOptions(1000 * 60 * 60 * 24 * 7));

      return {
        success: true,
        user: loginResponse.user,
        accessToken: loginResponse.access_token,  // 👈 necesario para Android
        refreshToken: loginResponse.refresh_token
      };
    }

    @Post('refresh')
async refresh(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
  @Body() body?: { refreshToken?: string }
) {
  // 1. Priorizar header Authorization (Bearer)
  const authHeader = req.headers['authorization'] as string | undefined;
  let refreshToken = undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    refreshToken = authHeader.replace('Bearer ', '');
  }

  // 2. Si no, cookie
  if (!refreshToken && req.cookies['refresh_jwt']) {
    refreshToken = req.cookies['refresh_jwt'];
  }

  // 3. Si no, body
  if (!refreshToken && body?.refreshToken) {
    refreshToken = body.refreshToken;
  }

  if (!refreshToken) throw new UnauthorizedException('No autorizado');

  try {
    const { access_token, refresh_token } = await this.authService.refreshToken(refreshToken);

    // Si quieres seguir manteniendo cookies para web:
    if (req.cookies['refresh_jwt']) {
      res.cookie('jwt', access_token, this.getCookieOptions(1000 * 60 * 5));
      res.cookie('refresh_jwt', refresh_token, this.getCookieOptions(1000 * 60 * 60 * 24 * 7));
    }
    return { success: true, accessToken: access_token };
  } catch {
    res.clearCookie('jwt');
    res.clearCookie('refresh_jwt');
    throw new UnauthorizedException('Refresh token inválido');
  }
}


    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const token = req.cookies['jwt'];
      if (token) {
        try {
          const payload: any = this.jwtService.verify(token, { ignoreExpiration: true });
          await this.authService.logout(payload.sub, payload.jti, payload.exp);
        } catch {
          // ignoramos error, pero limpiamos cookies Luego debemos manejarlo ....
        }
      }
      res.clearCookie('jwt');
      res.clearCookie('refresh_jwt');
      return { success: true };
    }

    @Post('logout-all')
    async logoutAll(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const token = req.cookies['jwt'];
      if (token) {
        try {
          const payload: any = this.jwtService.verify(token, { ignoreExpiration: true });
          await this.authService.logoutAll(payload.sub);
        } catch {
          // ignoramos error, lo mismo, debemos manejarlo luego ....
        }
      }
      res.clearCookie('jwt');
      res.clearCookie('refresh_jwt');
      return { success: true };
    }

    @Get('me')
  @UseGuards(JwtRedisGuard)
  async me(@Req() req: any) {
    const user = await this.authService.me(req.user.sub);

    // Obtener signed URL dinámico
    let avatarUrl = '/default-avatar.png';
    try {
      avatarUrl = await getProfilePictureSignedUrl(user.id);
    } catch (err) {
      console.warn('No se pudo generar signed URL para avatar:', err);
    }

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      avatarUrl
    };
  }
}

