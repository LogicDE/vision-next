import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from '../../entities/state.entity';
import { Country } from '../../entities/country.entity';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private stateRepo: Repository<State>,
    @InjectRepository(Country)
    private countryRepo: Repository<Country>,
  ) {}

  async create(dto: CreateStateDto) {
    const existing = await this.stateRepo.findOne({ where: { name: dto.name, country: { id: dto.id_country } } });
    if (existing) throw new BadRequestException('El estado ya existe para este país');

    const country = await this.countryRepo.findOne({ where: { id: dto.id_country } });
    if (!country) throw new NotFoundException('País no encontrado');

    const state = this.stateRepo.create({ name: dto.name, country });
    return this.stateRepo.save(state);
  }

  findAll() {
    return this.stateRepo.find({ relations: ['country', 'enterprises'] });
  }

  async findOne(id: number) {
    const state = await this.stateRepo.findOne({ where: { id }, relations: ['country', 'enterprises'] });
    if (!state) throw new NotFoundException('Estado no encontrado');
    return state;
  }

  async update(id: number, dto: UpdateStateDto) {
    const state = await this.findOne(id);

    if (dto.id_country) {
      const country = await this.countryRepo.findOne({ where: { id: dto.id_country } });
      if (!country) throw new NotFoundException('País no encontrado');
      state.country = country;
    }

    if (dto.name) state.name = dto.name;

    return this.stateRepo.save(state);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.stateRepo.delete(id);
    return { message: 'Estado eliminado correctamente' };
  }
}
