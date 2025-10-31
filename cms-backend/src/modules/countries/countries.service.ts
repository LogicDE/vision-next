import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../../entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
  ) {}

  create(dto: CreateCountryDto) {
    const country = this.countryRepo.create(dto);
    return this.countryRepo.save(country);
  }

  findAll() {
    return this.countryRepo.find({ relations: ['adminSubdivisions', 'postalCodes'] });
  }

  async findOne(id: number) {
    const country = await this.countryRepo.findOne({
      where: { id },
      relations: ['adminSubdivisions', 'postalCodes'],
    });
    if (!country) throw new NotFoundException('Country no encontrado');
    return country;
  }

  async update(id: number, dto: UpdateCountryDto) {
    await this.countryRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.countryRepo.delete(id);
    return { message: 'Country eliminado' };
  }
}
