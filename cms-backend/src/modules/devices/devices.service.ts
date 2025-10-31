import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
  ) {}

  create(dto: CreateDeviceDto) {
    const device = this.deviceRepo.create({
      ...dto,
      location: { id: dto.idLocation },
    });
    return this.deviceRepo.save(device);
  }

  findAll() {
    return this.deviceRepo.find({ relations: ['location'] });
  }

  async findOne(id: number) {
    const device = await this.deviceRepo.findOne({
      where: { id },
      relations: ['location'],
    });
    if (!device) throw new NotFoundException('Device no encontrado');
    return device;
  }

  async update(id: number, dto: UpdateDeviceDto) {
    const device = await this.findOne(id);
    if (dto.idLocation) device.location = { id: dto.idLocation } as any;
    if (dto.name !== undefined) device.name = dto.name;
    if (dto.deviceType) device.deviceType = dto.deviceType;
    return this.deviceRepo.save(device);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.deviceRepo.delete(id);
    return { message: 'Device eliminado' };
  }
}
