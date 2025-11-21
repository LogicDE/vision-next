import { IsString, IsOptional, IsDateString, IsNumber, Length } from 'class-validator';

export class CreateEventDto {
  @IsNumber()
  groupId!: number;

  @IsString()
  @Length(1, 100)
  titleMessage!: string;

  @IsString()
  @Length(1, 255)
  bodyMessage!: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  coordinatorName?: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsDateString()
  endAt!: string;
}
