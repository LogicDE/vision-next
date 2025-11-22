import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { JwtRedisGuard } from './jwt-redis.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: 300, // 5 minutos en segundos
        },
      }),
    }),
  ],
  providers: [AuthService, RedisService, JwtRedisGuard],
  controllers: [AuthController],
  exports: [JwtRedisGuard, JwtModule, RedisService],
})
export class AuthModule {}
