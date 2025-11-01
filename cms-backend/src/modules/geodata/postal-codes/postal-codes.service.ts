import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostalCode } from '../../../entities/postal-code.entity';
import { Country } from '../../../entities/country.entity';
import { CreatePostalCodeDto } from './dto/create-postal-code.dto';
import { UpdatePostalCodeDto } from './dto/update-postal-code.dto';

@Injectable()
export class PostalCodesService {
  constructor(
    @InjectRepository(PostalCode)
    private repo: Repository<PostalCode>,
    @InjectRepository(Country)
    private countryRepo: Repository<Country>,
  ) {}

  async create(dto: CreatePostalCodeDto) {
    const country = await this.countryRepo.findOneBy({ id: dto.countryId });
    if (!country) throw new NotFoundException('Country no encontrado');

    const postalCode = this.repo.create({
      country,
      code: dto.code,
    });

    return this.repo.save(postalCode);
  }

  findAll() {
    return this.repo.find({ relations: ['country', 'addresses'] });
  }

  async findOne(id: number) {
    const postalCode = await this.repo.findOne({
      where: { id },
      relations: ['country', 'addresses'],
    });
    if (!postalCode) throw new NotFoundException('PostalCode no encontrado');
    return postalCode;
  }

  async update(id: number, dto: UpdatePostalCodeDto) {
    const postalCode = await this.findOne(id);

    if (dto.countryId !== undefined) {
      const country = await this.countryRepo.findOneBy({ id: dto.countryId });
      if (!country) throw new NotFoundException('Country no encontrado');
      postalCode.country = country;
    }

    if (dto.code !== undefined) postalCode.code = dto.code;

    return this.repo.save(postalCode);
  }

  async remove(id: number) {
    const postalCode = await this.findOne(id);
    await this.repo.remove(postalCode);
    return { message: 'PostalCode eliminado' };
  }
}
