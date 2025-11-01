import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { GroupSurveyScoresService } from './group-survey-scores.service';
import { CreateGroupSurveyScoreDto } from './dto/create-group-survey-score.dto';
import { UpdateGroupSurveyScoreDto } from './dto/update-group-survey-score.dto';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('group-survey-scores')
@UseGuards(JwtRedisGuard, RolesGuard)
export class GroupSurveyScoresController {
  constructor(private readonly service: GroupSurveyScoresService) {}

  @Post()
  @Roles('Admin', 'Manager')
  create(@Body() dto: CreateGroupSurveyScoreDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Manager')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Roles('Admin', 'Manager')
  update(@Param('id') id: number, @Body() dto: UpdateGroupSurveyScoreDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Manager')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
