import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyEmployeeMetricDto } from './create-daily-employee-metric.dto';

export class UpdateDailyEmployeeMetricDto extends PartialType(CreateDailyEmployeeMetricDto) {}
