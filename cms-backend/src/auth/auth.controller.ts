import { Controller, Post, Body, Res, Get, Req, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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

    return { success: true, user: loginResponse.user };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_jwt'];
    if (!refreshToken) throw new UnauthorizedException('No autorizado');

    try {
      const { access_token } = await this.authService.refreshToken(refreshToken);
      res.cookie('jwt', access_token, this.getCookieOptions(1000 * 60 * 5));
      return { success: true };
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
  async me(@Req() req: Request) {
    const token = req.cookies['jwt'];
    if (!token) throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);

    try {
      const payload: any = this.jwtService.verify(token);
      return { id: payload.sub, nombre: payload.nombre, email: payload.email, rol: payload.role };
    } catch {
      throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
    }
  }
}
