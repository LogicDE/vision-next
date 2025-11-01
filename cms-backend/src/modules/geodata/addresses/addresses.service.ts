import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../../entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  create(dto: CreateAddressDto) {
    const address = this.addressRepo.create({
      streetNumber: dto.streetNumber,
      streetName: dto.streetName,
      postalCode: { id: dto.idPostalCode },
      neighborhood: { id: dto.idNeighborhood },
    });
    return this.addressRepo.save(address);
  }

  findAll() {
    return this.addressRepo.find({ relations: ['postalCode', 'neighborhood'] });
  }

  async findOne(id: number) {
    const address = await this.addressRepo.findOne({ 
      where: { id }, 
      relations: ['postalCode', 'neighborhood'] 
    });
    if (!address) throw new NotFoundException('Address no encontrada');
    return address;
  }

  async update(id: number, dto: UpdateAddressDto) {
    await this.addressRepo.update(id, {
      streetNumber: dto.streetNumber,
      streetName: dto.streetName,
      postalCode: dto.idPostalCode ? { id: dto.idPostalCode } : undefined,
      neighborhood: dto.idNeighborhood ? { id: dto.idNeighborhood } : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.addressRepo.delete(id);
    return { message: 'Address eliminada' };
  }
}
