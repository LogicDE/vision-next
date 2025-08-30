// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,     // ⚠️ solo para desarrollo
      retryAttempts: 10,     // reintentos de conexión
      retryDelay: 3000,      // 3s entre cada intento
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
