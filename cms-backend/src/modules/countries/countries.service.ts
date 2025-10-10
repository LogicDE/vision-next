import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../../entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private countryRepo: Repository<Country>,
  ) {}

  async create(dto: CreateCountryDto) {
    const exists = await this.countryRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new BadRequestException('El país ya existe');
    const c = this.countryRepo.create(dto);
    return this.countryRepo.save(c);
  }

  findAll() {
    return this.countryRepo.find({ relations: ['states'] });
  }

  async findOne(id: number) {
    const c = await this.countryRepo.findOne({ where: { id }, relations: ['states'] });
    if (!c) throw new NotFoundException('País no encontrado');
    return c;
  }

  async update(id: number, dto: UpdateCountryDto) {
    await this.findOne(id);
    await this.countryRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.countryRepo.delete(id);
    return { message: 'País eliminado correctamente' };
  }
}
