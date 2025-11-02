import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { QuestionI18nService } from './question-i18n.service';
import { CreateQuestionI18nDto } from './dto/create-question-i18n.dto';
import { UpdateQuestionI18nDto } from './dto/update-question-i18n.dto';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('question-i18n')
@UseGuards(JwtRedisGuard, RolesGuard)
export class QuestionI18nController {
  constructor(private readonly service: QuestionI18nService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateQuestionI18nDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.service.findAll();
  }

  @Get(':questionId/:locale')
  @Roles('Admin', 'Manager')
  findOne(
    @Param('questionId') questionId: number,
    @Param('locale') locale: string,
  ) {
    return this.service.findOne(+questionId, locale);
  }

  @Put(':questionId/:locale')
  @Roles('Admin')
  update(
    @Param('questionId') questionId: number,
    @Param('locale') locale: string,
    @Body() dto: UpdateQuestionI18nDto,
  ) {
    return this.service.update(+questionId, locale, dto);
  }

  @Delete(':questionId/:locale')
  @Roles('Admin')
  remove(
    @Param('questionId') questionId: number,
    @Param('locale') locale: string,
  ) {
    return this.service.remove(+questionId, locale);
  }
}
