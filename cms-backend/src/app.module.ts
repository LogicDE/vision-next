// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { Empresa } from './entities/empresa.entity';
import { Departamento } from './entities/departamento.entity';
import { Rol } from './entities/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true, // ✅ detecta todas las entidades importadas en los módulos
      synchronize: false,
    }),
    AuthModule, // ✅ aquí importa tu módulo de auth
    TypeOrmModule.forFeature([User, Empresa, Departamento, Rol]), // opcional si quieres repositorios globales
  ],
})
export class AppModule {}
