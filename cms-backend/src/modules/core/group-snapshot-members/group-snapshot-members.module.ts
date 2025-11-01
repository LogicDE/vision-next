import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupSnapshotMember } from '../../../entities/group-snapshot-member.entity';
import { GroupSnapshot } from '../../../entities/group-snapshot.entity';
import { Employee } from '../../../entities/employee.entity';
import { GroupSnapshotMembersService } from './group-snapshot-members.service';
import { GroupSnapshotMembersController } from './group-snapshot-members.controller';
import { AuthModule } from '../../../auth/auth.module';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupSnapshotMember, GroupSnapshot, Employee]),
    AuthModule,
  ],
  controllers: [GroupSnapshotMembersController],
  providers: [GroupSnapshotMembersService, JwtRedisGuard],
  exports: [GroupSnapshotMembersService],
})
export class GroupSnapshotMembersModule {}
