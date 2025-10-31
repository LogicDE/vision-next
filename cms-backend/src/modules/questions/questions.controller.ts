import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('questions')
@UseGuards(JwtRedisGuard, RolesGuard)
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateQuestionDto) {
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
  @Roles('Admin')
  update(@Param('id') id: number, @Body() dto: UpdateQuestionDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
