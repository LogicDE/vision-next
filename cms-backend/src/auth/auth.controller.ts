import { Controller, Post, Body, Res, HttpException, HttpStatus, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private jwtService: JwtService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const loginResponse = await this.authService.login(body.email, body.password);

    // Guardar JWT en cookie httpOnly
    res.cookie('jwt', loginResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hora
    });

    return {
      success: true,
      user: loginResponse.user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { success: true };
  }

  @Get('me')
  async me(@Req() req: Request) {
    try {
      const token = req.cookies['jwt'];
      if (!token) throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);

      const payload = this.jwtService.verify(token);
      return {
        id: payload.sub,
        nombre: payload.email, // opcional: cambiar por nombre real si lo guardas
        email: payload.email,
        rol: payload.role,
      };
    } catch {
      throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
    }
  }
}
