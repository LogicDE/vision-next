import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PostalCodesService } from './postal-codes.service';
import { CreatePostalCodeDto } from './dto/create-postal-code.dto';
import { UpdatePostalCodeDto } from './dto/update-postal-code.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('postal-codes')
@UseGuards(JwtRedisGuard, RolesGuard)
export class PostalCodesController {
  constructor(private readonly service: PostalCodesService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreatePostalCodeDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdatePostalCodeDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
