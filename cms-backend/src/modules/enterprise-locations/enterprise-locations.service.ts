import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnterpriseLocation } from '../../entities/enterprise-location.entity';
import { CreateEnterpriseLocationDto } from './dto/create-enterprise-location.dto';
import { UpdateEnterpriseLocationDto } from './dto/update-enterprise-location.dto';

@Injectable()
export class EnterpriseLocationsService {
  constructor(
    @InjectRepository(EnterpriseLocation)
    private readonly locationRepo: Repository<EnterpriseLocation>,
  ) {}

  create(dto: CreateEnterpriseLocationDto) {
    const location = this.locationRepo.create({
      ...dto,
      enterprise: { id: dto.idEnterprise } as any,
      address: { id: dto.idAddress } as any,
    });
    return this.locationRepo.save(location);
  }

  findAll() {
    return this.locationRepo.find({ relations: ['enterprise', 'address', 'devices'] });
  }

  async findOne(id: number) {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['enterprise', 'address', 'devices'],
    });
    if (!location) throw new NotFoundException('EnterpriseLocation no encontrada');
    return location;
  }

  async update(id: number, dto: UpdateEnterpriseLocationDto) {
    const location = await this.findOne(id);
    if (dto.idEnterprise) location.enterprise = { id: dto.idEnterprise } as any;
    if (dto.idAddress) location.address = { id: dto.idAddress } as any;
    if (dto.locationName) location.locationName = dto.locationName;
    if (dto.active !== undefined) location.active = dto.active;
    return this.locationRepo.save(location);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.locationRepo.delete(id);
    return { message: 'EnterpriseLocation eliminada' };
  }
}
