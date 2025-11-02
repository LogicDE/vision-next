import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { AdminSubdivision } from '../../entities/admin-subdivision.entity';
import { AdminSubdivisionsService } from './admin-subdivisions.service';
import { AdminSubdivisionsController } from './admin-subdivisions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminSubdivision]),
    AuthModule,
  ],
  controllers: [AdminSubdivisionsController],
  providers: [AdminSubdivisionsService],
  exports: [AdminSubdivisionsService],
})
export class AdminSubdivisionsModule {}
