import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from '../../entities/state.entity';
import { Country } from '../../entities/country.entity';
import { StatesService } from './states.service';
import { StatesController } from './states.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([State, Country]),
    AuthModule,
  ],
  controllers: [StatesController],
  providers: [StatesService],
  exports: [StatesService],
})
export class StatesModule {}
