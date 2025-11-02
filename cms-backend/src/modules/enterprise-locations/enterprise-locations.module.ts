import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { EnterpriseLocation } from '../../entities/enterprise-location.entity';
import { EnterpriseLocationsService } from './enterprise-locations.service';
import { EnterpriseLocationsController } from './enterprise-locations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnterpriseLocation]),
    AuthModule,
  ],
  controllers: [EnterpriseLocationsController],
  providers: [EnterpriseLocationsService],
  exports: [EnterpriseLocationsService],
})
export class EnterpriseLocationsModule {}
