import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminSubdivisionDto } from './create-admin-subdivision.dto';

export class UpdateAdminSubdivisionDto extends PartialType(CreateAdminSubdivisionDto) {}
