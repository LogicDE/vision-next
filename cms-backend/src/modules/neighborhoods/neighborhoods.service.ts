import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Neighborhood } from '../../entities/neighborhood.entity';
import { City } from '../../entities/city.entity';
import { CreateNeighborhoodDto } from './dto/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from './dto/update-neighborhood.dto';

@Injectable()
export class NeighborhoodsService {
  constructor(
    @InjectRepository(Neighborhood)
    private repo: Repository<Neighborhood>,
    @InjectRepository(City)
    private cityRepo: Repository<City>,
  ) {}

  async create(dto: CreateNeighborhoodDto) {
    const city = await this.cityRepo.findOneBy({ id: dto.cityId });
    if (!city) throw new NotFoundException('City no encontrada');

    const neighborhood = this.repo.create({
      city,
      name: dto.name,
    });

    return this.repo.save(neighborhood);
  }

  findAll() {
    return this.repo.find({ relations: ['city', 'addresses'] });
  }

  async findOne(id: number) {
    const neighborhood = await this.repo.findOne({
      where: { id },
      relations: ['city', 'addresses'],
    });
    if (!neighborhood) throw new NotFoundException('Neighborhood no encontrado');
    return neighborhood;
  }

  async update(id: number, dto: UpdateNeighborhoodDto) {
    const neighborhood = await this.findOne(id);

    if (dto.cityId !== undefined) {
      const city = await this.cityRepo.findOneBy({ id: dto.cityId });
      if (!city) throw new NotFoundException('City no encontrada');
      neighborhood.city = city;
    }

    if (dto.name !== undefined) neighborhood.name = dto.name;

    return this.repo.save(neighborhood);
  }

  async remove(id: number) {
    const neighborhood = await this.findOne(id);
    await this.repo.remove(neighborhood);
    return { message: 'Neighborhood eliminado' };
  }
}
