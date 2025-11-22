import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enterprise } from '../../../entities/enterprise.entity';
import { Employee } from '../../../entities/employee.entity';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';

@Injectable()
export class EnterprisesService {
  constructor(
    @InjectRepository(Enterprise)
    private readonly enterpriseRepo: Repository<Enterprise>,
  ) {}

  async create(dto: CreateEnterpriseDto) {
    if (!/^\d{9,15}$/.test(dto.telephone)) {
      throw new BadRequestException('El teléfono debe tener entre 9 y 15 dígitos numéricos');
    }

    try {
      const enterprise = this.enterpriseRepo.create(dto);
      return await this.enterpriseRepo.save(enterprise);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('El correo electrónico ya está registrado en otra empresa');
      }
      throw error;
    }
  }

  findAll() {
    return this.enterpriseRepo.find({
      where: { isDeleted: false },
      relations: ['locations', 'locations.devices', 'locations.address', 'employees'],
    });
  }

  async findOne(id: number) {
    const enterprise = await this.enterpriseRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['locations', 'locations.devices', 'locations.address', 'employees'],
    });

    if (!enterprise) throw new NotFoundException('Enterprise no encontrada');

    return enterprise;
  }

  async update(id: number, dto: UpdateEnterpriseDto) {
    const enterprise = await this.findOne(id);
    Object.assign(enterprise, dto);
    return this.enterpriseRepo.save(enterprise);
  }

  async remove(id: number, deletedBy?: number) {
    const enterprise = await this.findOne(id);
    const timestamp = Date.now();
    enterprise.isDeleted = true;
    if (deletedBy) {
      enterprise.deletedBy = { id: deletedBy } as Employee;
    }
    // Clear unique fields to prevent conflicts
    enterprise.email = `deleted_${id}_${timestamp}@deleted.local`;
    enterprise.telephone = undefined;
    await this.enterpriseRepo.save(enterprise);
    return { message: 'Enterprise eliminada' };
  }
}
