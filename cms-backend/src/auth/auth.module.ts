import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { JwtRedisGuard } from './jwt-redis.guard';
import type { StringValue } from 'ms';

const toExpires = (value: string | undefined, fallback: number | StringValue): number | StringValue => {
  if (!value) return fallback;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? (value as StringValue) : numeric;
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: toExpires(configService.get<string>('JWT_EXPIRES_IN'), '1h'),
        },
      }),
    }),
  ],
  providers: [AuthService, RedisService, JwtRedisGuard],
  controllers: [AuthController],
  exports: [JwtRedisGuard, JwtModule, RedisService], // para poder usarlo en otros módulos si es necesario
})
export class AuthModule {}
