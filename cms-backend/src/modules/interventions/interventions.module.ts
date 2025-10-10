import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Intervention } from '../../entities/intervention.entity';
import { Employee } from '../../entities/employee.entity';
import { Group } from '../../entities/group.entity';
import { InterventionsService } from './interventions.service';
import { InterventionsController } from './interventions.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Intervention, Employee, Group]),
    AuthModule,
  ],
  controllers: [InterventionsController],
  providers: [InterventionsService],
  exports: [InterventionsService],
})
export class InterventionsModule {}
