import { PartialType } from '@nestjs/mapped-types';
import { CreateNeighborhoodDto } from './create-neighborhood.dto';

export class UpdateNeighborhoodDto extends PartialType(CreateNeighborhoodDto) {}
