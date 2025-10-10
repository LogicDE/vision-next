import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Action } from '../../entities/action.entity';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(Action)
    private readonly actionRepo: Repository<Action>,
  ) {}

  create(dto: CreateActionDto) {
    const action = this.actionRepo.create(dto);
    return this.actionRepo.save(action);
  }

  findAll() {
    return this.actionRepo.find();
  }

  async findOne(id: number) {
    const action = await this.actionRepo.findOne({ where: { id_action: id } });
    if (!action) throw new NotFoundException('Action no encontrada');
    return action;
  }

  async update(id: number, dto: UpdateActionDto) {
    await this.actionRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.actionRepo.delete(id);
    return { message: 'Action eliminada' };
  }
}
