// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,    // Deshabilitado porque la tabla ya existe
      retryAttempts: 10,     // reintentos de conexión
      retryDelay: 3000,      // 3s entre cada intento
    }),
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
