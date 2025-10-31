import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enterprise } from '../../entities/enterprise.entity';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';

@Injectable()
export class EnterprisesService {
  constructor(
    @InjectRepository(Enterprise)
    private readonly enterpriseRepo: Repository<Enterprise>,
  ) {}

  create(dto: CreateEnterpriseDto) {
    const enterprise = this.enterpriseRepo.create(dto);
    return this.enterpriseRepo.save(enterprise);
  }

  findAll() {
    return this.enterpriseRepo.find({
      relations: ['locations', 'employees'],
    });
  }

  async findOne(id: number) {
    const enterprise = await this.enterpriseRepo.findOne({
      where: { id },
      relations: ['locations', 'employees'],
    });

    if (!enterprise) throw new NotFoundException('Enterprise no encontrada');

    return enterprise;
  }

  async update(id: number, dto: UpdateEnterpriseDto) {
    const enterprise = await this.findOne(id);
    Object.assign(enterprise, dto);
    return this.enterpriseRepo.save(enterprise);
  }

  async remove(id: number) {
    const enterprise = await this.findOne(id);
    await this.enterpriseRepo.remove(enterprise);
    return { message: 'Enterprise eliminada' };
  }
}
