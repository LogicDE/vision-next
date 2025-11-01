// src/modules/filters/filters.module.ts
import { Module } from '@nestjs/common';
import { FiltersService } from './filters.service';

@Module({
  providers: [FiltersService],
  exports: [FiltersService],
})
export class FiltersModule {}

//boilerplate