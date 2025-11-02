import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../../../entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  create(dto: CreateCityDto) {
    const city = this.cityRepo.create({
      name: dto.name,
      area: { id: dto.idArea },
    });
    return this.cityRepo.save(city);
  }

  findAll() {
    return this.cityRepo.find({ relations: ['area', 'neighborhoods'] });
  }

  async findOne(id: number) {
    const city = await this.cityRepo.findOne({
      where: { id },
      relations: ['area', 'neighborhoods'],
    });
    if (!city) throw new NotFoundException('City no encontrada');
    return city;
  }

  async update(id: number, dto: UpdateCityDto) {
    await this.cityRepo.update(id, {
      name: dto.name,
      area: dto.idArea ? { id: dto.idArea } : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.cityRepo.delete(id);
    return { message: 'City eliminada' };
  }
}
