import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private repo: Repository<Question>,
  ) {}

  async create(dto: CreateQuestionDto) {
    // Questions are now global (no group association)
    const question = this.repo.create({});
    return this.repo.save(question);
  }

  findAll() {
    return this.repo.find({ 
      where: { isDeleted: false },
      relations: ['i18nTexts'] 
    });
  }

  async findOne(id: number) {
    const question = await this.repo.findOne({
      where: { id, isDeleted: false },
      relations: ['i18nTexts'],
    });
    if (!question) throw new NotFoundException('Question no encontrada');
    return question;
  }

  async update(id: number, dto: UpdateQuestionDto) {
    const question = await this.findOne(id);
    // Questions are now global (no group association to update)
    return this.repo.save(question);
  }

  async remove(id: number) {
    const question = await this.findOne(id);
    await this.repo.remove(question);
    return { message: 'Question eliminada' };
  }
}
