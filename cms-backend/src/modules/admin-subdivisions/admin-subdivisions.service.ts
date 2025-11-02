import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminSubdivision } from '../../entities/admin-subdivision.entity';
import { CreateAdminSubdivisionDto } from './dto/create-admin-subdivision.dto';
import { UpdateAdminSubdivisionDto } from './dto/update-admin-subdivision.dto';

@Injectable()
export class AdminSubdivisionsService {
  constructor(
    @InjectRepository(AdminSubdivision)
    private readonly areaRepo: Repository<AdminSubdivision>,
  ) {}

  create(dto: CreateAdminSubdivisionDto) {
    const area = this.areaRepo.create({
      isoCode: dto.isoCode,
      name: dto.name,
      country: { id: dto.idCountry },
    });
    return this.areaRepo.save(area);
  }

  findAll() {
    return this.areaRepo.find({ relations: ['country', 'cities'] });
  }

  async findOne(id: number) {
    const area = await this.areaRepo.findOne({
      where: { id },
      relations: ['country', 'cities'],
    });
    if (!area) throw new NotFoundException('Admin Subdivision no encontrada');
    return area;
  }

  async update(id: number, dto: UpdateAdminSubdivisionDto) {
    await this.areaRepo.update(id, {
      isoCode: dto.isoCode,
      name: dto.name,
      country: dto.idCountry ? { id: dto.idCountry } : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.areaRepo.delete(id);
    return { message: 'Admin Subdivision eliminada' };
  }
}
