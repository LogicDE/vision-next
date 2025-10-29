import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enterprise } from '../../entities/enterprise.entity';
import { State } from '../../entities/state.entity';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';

@Injectable()
export class EnterprisesService {
  constructor(
    @InjectRepository(Enterprise)
    private enterpriseRepo: Repository<Enterprise>,
    @InjectRepository(State)
    private stateRepo: Repository<State>,
  ) {}

  async create(dto: CreateEnterpriseDto) {
    const existingName = await this.enterpriseRepo.findOne({ where: { name: dto.name } });
    if (existingName) throw new BadRequestException('Ya existe una empresa con ese nombre');

    const existingEmail = await this.enterpriseRepo.findOne({ where: { email: dto.email } });
    if (existingEmail) throw new BadRequestException('Ya existe una empresa con ese correo');

    const state = await this.stateRepo.findOne({ where: { id_state: dto.id_state } });
    if (!state) throw new NotFoundException('Estado no encontrado');

    const enterprise = this.enterpriseRepo.create({
      name: dto.name,
      telephone: dto.telephone,
      email: dto.email,
      state,
    });

    return this.enterpriseRepo.save(enterprise);
  }

  findAll() {
    return this.enterpriseRepo.find({ relations: ['state', 'country'] });
  }

  async findOne(id: number) {
    const enterprise = await this.enterpriseRepo.findOne({
      where: { id_enterprise: id },
      relations: ['state', 'country']
    });
    if (!enterprise) throw new NotFoundException('Empresa no encontrada');
    return enterprise;
  }

  async update(id: number, dto: UpdateEnterpriseDto) {
    const enterprise = await this.findOne(id);

    if (dto.id_state) {
      const state = await this.stateRepo.findOne({ where: { id_state: dto.id_state } });
      if (!state) throw new NotFoundException('Estado no encontrado');
      enterprise.state = state;
    }

    if (dto.name) enterprise.name = dto.name;
    if (dto.telephone) enterprise.telephone = dto.telephone;
    if (dto.email) enterprise.email = dto.email;

    return this.enterpriseRepo.save(enterprise);
  }

  async remove(id: number) {
    const enterprise = await this.findOne(id);
    await this.enterpriseRepo.remove(enterprise);
    return { message: 'Empresa eliminada correctamente' };
  }
}

