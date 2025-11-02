import { PartialType } from '@nestjs/mapped-types';
import { CreateEnterpriseLocationDto } from './create-enterprise-location.dto';

export class UpdateEnterpriseLocationDto extends PartialType(CreateEnterpriseLocationDto) {}
