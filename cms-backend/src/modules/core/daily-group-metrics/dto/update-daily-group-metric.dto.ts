import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyGroupMetricDto } from './create-daily-group-metric.dto';

export class UpdateDailyGroupMetricDto extends PartialType(CreateDailyGroupMetricDto) {}
