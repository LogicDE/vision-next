import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { IndivSurveyScoresService } from './indiv-survey-scores.service';
import { CreateIndivSurveyScoreDto } from './dto/create-indiv-survey-score.dto';
import { UpdateIndivSurveyScoreDto } from './dto/update-indiv-survey-score.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('indiv-survey-scores')
@UseGuards(JwtRedisGuard, RolesGuard)
export class IndivSurveyScoresController {
  constructor(private readonly service: IndivSurveyScoresService) {}

  @Post()
  @Roles('Admin', 'Manager')
  create(@Body() dto: CreateIndivSurveyScoreDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateIndivSurveyScoreDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Manager')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
