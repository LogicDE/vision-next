import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { GroupEmployee } from '../../../entities/group-employee.entity';
import { GroupEmployeesService } from './group-employees.service';
import { GroupEmployeesController } from './group-employees.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEmployee]),
    AuthModule,
  ],
  controllers: [GroupEmployeesController],
  providers: [GroupEmployeesService],
  exports: [GroupEmployeesService],
})
export class GroupEmployeesModule {}
