import { IsNumber, IsOptional, IsDateString, IsString, Length } from 'class-validator';

export class CreateGroupSnapshotDto {
  @IsNumber()
  groupId!: number;

  @IsOptional()
  @IsDateString()
  windowStart?: string;

  @IsOptional()
  @IsDateString()
  windowEnd?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  jobVersion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 128)
  cohortHash?: string;
}
