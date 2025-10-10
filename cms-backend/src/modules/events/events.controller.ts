import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('events')
@UseGuards(JwtRedisGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('admin', 'editor')
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  @Roles('admin', 'editor', 'viewer')
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  findOne(@Param('id') id: number) {
    return this.eventsService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin', 'editor')
  update(@Param('id') id: number, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: number) {
    return this.eventsService.remove(+id);
  }
}
