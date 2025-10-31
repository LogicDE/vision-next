import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { Group } from '../../entities/group.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private repo: Repository<Question>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateQuestionDto) {
    let group;
    if (dto.groupId) {
      group = await this.groupRepo.findOneBy({ id: dto.groupId });
      if (!group) throw new NotFoundException('Group no encontrado');
    }

    const question = this.repo.create({ group });
    return this.repo.save(question);
  }

  findAll() {
    return this.repo.find({ relations: ['group', 'i18nTexts'] });
  }

  async findOne(id: number) {
    const question = await this.repo.findOne({
      where: { id },
      relations: ['group', 'i18nTexts'],
    });
    if (!question) throw new NotFoundException('Question no encontrada');
    return question;
  }

  async update(id: number, dto: UpdateQuestionDto) {
    const question = await this.findOne(id);

    if (dto.groupId !== undefined) {
      const group = await this.groupRepo.findOneBy({ id: dto.groupId });
      if (!group) throw new NotFoundException('Group no encontrado');
      question.group = group;
    }

    return this.repo.save(question);
  }

  async remove(id: number) {
    const question = await this.findOne(id);
    await this.repo.remove(question);
    return { message: 'Question eliminada' };
  }
}
