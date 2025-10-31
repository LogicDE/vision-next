import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  create(dto: CreateServiceDto) {
    const service = this.serviceRepo.create(dto);
    return this.serviceRepo.save(service);
  }

  findAll() {
    return this.serviceRepo.find();
  }

  async findOne(id: number) {
    const service = await this.serviceRepo.findOne({ where: { id: id } });
    if (!service) throw new NotFoundException('Service no encontrado');
    return service;
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.serviceRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.serviceRepo.delete(id);
    return { message: 'Service eliminada' };
  }
}
