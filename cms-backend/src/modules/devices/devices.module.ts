import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { Device } from '../../entities/device.entity';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { EnterpriseLocation } from '../../entities/enterprise-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, EnterpriseLocation]),
    AuthModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
