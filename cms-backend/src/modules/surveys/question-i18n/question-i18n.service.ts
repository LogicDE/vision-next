import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionI18n } from '../../../entities/question-i18n.entity';
import { Question } from '../../../entities/question.entity';
import { CreateQuestionI18nDto } from './dto/create-question-i18n.dto';
import { UpdateQuestionI18nDto } from './dto/update-question-i18n.dto';

@Injectable()
export class QuestionI18nService {
  constructor(
    @InjectRepository(QuestionI18n)
    private repo: Repository<QuestionI18n>,
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async create(dto: CreateQuestionI18nDto) {
    const question = await this.questionRepo.findOneBy({ id: dto.questionId });
    if (!question) throw new NotFoundException('Question no encontrada');

    const i18n = this.repo.create({
      question,
      locale: dto.locale,
      text: dto.text,
    });

    return this.repo.save(i18n);
  }

  findAll() {
    return this.repo.find({ relations: ['question'] });
  }

  async findOne(questionId: number, locale: string) {
    const i18n = await this.repo.findOne({
      where: { questionId, locale },
      relations: ['question'],
    });
    if (!i18n) throw new NotFoundException('QuestionI18n no encontrada');
    return i18n;
  }

  async update(questionId: number, locale: string, dto: UpdateQuestionI18nDto) {
    const i18n = await this.findOne(questionId, locale);

    if (dto.questionId !== undefined) {
      const question = await this.questionRepo.findOneBy({ id: dto.questionId });
      if (!question) throw new NotFoundException('Question no encontrada');
      i18n.question = question;
      i18n.questionId = dto.questionId;
    }

    if (dto.locale !== undefined) i18n.locale = dto.locale;
    if (dto.text !== undefined) i18n.text = dto.text;

    return this.repo.save(i18n);
  }

  async remove(questionId: number, locale: string) {
    const i18n = await this.findOne(questionId, locale);
    await this.repo.remove(i18n);
    return { message: 'QuestionI18n eliminada' };
  }
}
