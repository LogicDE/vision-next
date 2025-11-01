import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { PostalCode } from '../../../entities/postal-code.entity';
import { Country } from '../../../entities/country.entity';
import { PostalCodesService } from './postal-codes.service';
import { PostalCodesController } from './postal-codes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostalCode, Country]),
    AuthModule,
  ],
  controllers: [PostalCodesController],
  providers: [PostalCodesService],
  exports: [PostalCodesService],
})
export class PostalCodesModule {}
