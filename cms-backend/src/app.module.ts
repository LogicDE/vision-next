import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config/config.module';
import { Employee } from './entities/employee.entity';
import { Rol } from './entities/rol.entity';
import { Empresa } from './entities/empresa.entity';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigAppModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigAppModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [Employee, Rol, Empresa],
        synchronize: false, // usar migrations en producción
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
