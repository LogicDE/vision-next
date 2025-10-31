import { IsOptional, IsInt, IsJSON, IsString, IsIP, IsDateString } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsInt()
  idActor?: number;

  @IsOptional()
  @IsInt()
  idAction?: number;

  @IsOptional()
  @IsInt()
  idService?: number;

  @IsOptional()
  @IsDateString()
  occurredAt?: Date;

  @IsOptional()
  @IsIP()
  ipActor?: string;

  @IsOptional()
  @IsString()
  objectType?: string;

  @IsJSON()
  changeSet!: Record<string, any>;
}
