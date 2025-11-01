import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupSnapshotDto } from './create-group-snapshot.dto';

export class UpdateGroupSnapshotDto extends PartialType(CreateGroupSnapshotDto) {}
