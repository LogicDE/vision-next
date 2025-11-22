import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { SurveyVersionsService } from './survey-versions.service';
import { CreateSurveyVersionDto } from './dto/create-survey-version.dto';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('survey-versions')
@UseGuards(JwtRedisGuard, RolesGuard)
export class SurveyVersionsController {
  constructor(private readonly service: SurveyVersionsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateSurveyVersionDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  async findAll() {
    const versions = await this.service.findAll();
    // Ensure we always return an array (even if empty)
    return Array.isArray(versions) ? versions : [];
  }

  @Get('current')
  @Roles('Admin', 'Manager')
  async getCurrent() {
    const version = await this.service.getCurrentVersion();
    // Ensure we always return valid JSON (null is valid JSON)
    return version;
  }

  @Put('current/:id')
  @Roles('Admin')
  setCurrent(@Param('id') id: number) {
    return this.service.setCurrentVersion(id);
  }

  @Get(':id')
  @Roles('Admin', 'Manager')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }
}

