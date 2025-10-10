import { Controller, Post, Get, Body, HttpException, HttpStatus, Session } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Session() session: Record<string, any>
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Guardar usuario en la sesión
    session.userId = user.id_employee;

    return {
      message: 'Login successful',
      user: {
        id: user.id_employee,
        email: user.email,
        username: user.username,
        name: `${user.first_name} ${user.last_name}`,
        rol: 'user'
      }
    };
  }

  @Get('me')
  async getMe(@Session() session: Record<string, any>) {
    if (!session.userId) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.authService.getUserById(session.userId);
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: user.id_employee,
      nombre: `${user.first_name} ${user.last_name}`,
      email: user.email,
      rol: 'user'
    };
  }

  @Post('logout')
  async logout(@Session() session: Record<string, any>) {
    session.userId = null;
    return { message: 'Logout successful' };
  }
}

