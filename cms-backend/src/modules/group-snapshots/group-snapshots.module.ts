import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { GroupSnapshot } from '../../entities/group-snapshot.entity';
import { Group } from '../../entities/group.entity';
import { DailyGroupMetric } from '../../entities/daily-group-metric.entity';
import { DailyEmployeeMetric } from '../../entities/daily-employee-metric.entity';
import { GroupSnapshotsService } from './group-snapshots.service';
import { GroupSnapshotsController } from './group-snapshots.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupSnapshot, Group, DailyGroupMetric, DailyEmployeeMetric]),
    AuthModule,
  ],
  controllers: [GroupSnapshotsController],
  providers: [GroupSnapshotsService],
  exports: [GroupSnapshotsService],
})
export class GroupSnapshotsModule {}
