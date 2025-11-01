import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { Neighborhood } from '../../../entities/neighborhood.entity';
import { City } from '../../../entities/city.entity';
import { NeighborhoodsService } from './neighborhoods.service';
import { NeighborhoodsController } from './neighborhoods.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Neighborhood, City]),
    AuthModule,
  ],
  controllers: [NeighborhoodsController],
  providers: [NeighborhoodsService],
  exports: [NeighborhoodsService],
})
export class NeighborhoodsModule {}
