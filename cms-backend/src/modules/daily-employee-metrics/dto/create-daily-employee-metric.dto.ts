import { IsNumber, IsEnum } from 'class-validator';
import { MetricEnum } from '../../../enums/metric.enum';
import { AggEnum } from '../../../enums/agg.enum';

export class CreateDailyEmployeeMetricDto {
  @IsNumber()
  employeeId!: number;

  @IsNumber()
  snapshotId!: number;

  @IsEnum(MetricEnum)
  metricName!: MetricEnum;

  @IsEnum(AggEnum)
  aggType!: AggEnum;

  @IsNumber()
  value!: number;
}
