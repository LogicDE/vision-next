import { Controller, Post, Body, Res, Get, Req, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private jwtService: JwtService) {}

  @Post('login')
async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
  const loginResponse = await this.authService.login(body.email, body.password);

  // Guardar access token
  res.cookie('jwt', loginResponse.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 10, // 10 segundos
  });

  // Guardar refresh token
  res.cookie('refresh_jwt', loginResponse.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60, // 1 minuto
  });

  return { success: true, user: loginResponse.user };
}

@Post('refresh')
async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies['refresh_jwt'];
  if (!refreshToken) {
    // Limpia cookies si no hay refresh token
    res.clearCookie('jwt');
    res.clearCookie('refresh_jwt');
    throw new UnauthorizedException('No autorizado');
  }

  try {
    const { access_token } = await this.authService.refreshToken(refreshToken);

    // Sobrescribe la cookie del JWT con nueva expiración
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 10, // 10 segundos, igual que JWT_EXPIRES_IN
    });

    return { success: true };
  } catch {
    // Si refresh token inválido → limpiar todo
    res.clearCookie('jwt');
    res.clearCookie('refresh_jwt');
    throw new UnauthorizedException('Refresh token inválido');
  }
}


  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    res.clearCookie('refresh_jwt');
    return { success: true };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies['jwt'];
    if (!token) throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);

    try {
      const payload = this.jwtService.verify(token);
      return {
        id: payload.sub,
        nombre: payload.email,
        email: payload.email,
        rol: payload.role,
      };
    } catch {
      throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
    }
  }
}
