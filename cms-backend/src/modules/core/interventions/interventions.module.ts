import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { Intervention } from '../../../entities/intervention.entity';
import { Group } from '../../../entities/group.entity';
import { GroupEmployee } from '../../../entities/group-employee.entity';
import { InterventionsService } from './interventions.service';
import { InterventionsController } from './interventions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Intervention, Group, GroupEmployee]),
    AuthModule,
  ],
  controllers: [InterventionsController],
  providers: [InterventionsService],
  exports: [InterventionsService],
})
export class InterventionsModule {}
