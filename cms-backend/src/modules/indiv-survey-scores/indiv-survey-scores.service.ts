import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndivSurveyScore } from '../../entities/indiv-survey-score.entity';
import { GroupSurveyScore } from '../../entities/group-survey-score.entity';
import { Employee } from '../../entities/employee.entity';
import { CreateIndivSurveyScoreDto } from './dto/create-indiv-survey-score.dto';
import { UpdateIndivSurveyScoreDto } from './dto/update-indiv-survey-score.dto';

@Injectable()
export class IndivSurveyScoresService {
  constructor(
    @InjectRepository(IndivSurveyScore)
    private repo: Repository<IndivSurveyScore>,
    @InjectRepository(GroupSurveyScore)
    private surveyRepo: Repository<GroupSurveyScore>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateIndivSurveyScoreDto) {
    const survey = await this.surveyRepo.findOneBy({ id: dto.surveyId });
    if (!survey) throw new NotFoundException('Survey no encontrado');

    const employee = await this.employeeRepo.findOneBy({ id: dto.employeeId });
    if (!employee) throw new NotFoundException('Employee no encontrado');

    const score = this.repo.create({
      survey,
      employee,
      submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : undefined,
      indivScore: dto.indivScore,
    });

    return this.repo.save(score);
  }

  findAll() {
    return this.repo.find({ relations: ['survey', 'employee'] });
  }

  async findOne(id: number) {
    const score = await this.repo.findOne({
      where: { id },
      relations: ['survey', 'employee'],
    });
    if (!score) throw new NotFoundException('IndivSurveyScore no encontrado');
    return score;
  }

  async update(id: number, dto: UpdateIndivSurveyScoreDto) {
    const score = await this.findOne(id);

    if (dto.surveyId !== undefined) {
      const survey = await this.surveyRepo.findOneBy({ id: dto.surveyId });
      if (!survey) throw new NotFoundException('Survey no encontrado');
      score.survey = survey;
    }

    if (dto.employeeId !== undefined) {
      const employee = await this.employeeRepo.findOneBy({ id: dto.employeeId });
      if (!employee) throw new NotFoundException('Employee no encontrado');
      score.employee = employee;
    }

    if (dto.submittedAt !== undefined) score.submittedAt = new Date(dto.submittedAt);
    if (dto.indivScore !== undefined) score.indivScore = dto.indivScore;

    return this.repo.save(score);
  }

  async remove(id: number) {
    const score = await this.findOne(id);
    await this.repo.remove(score);
    return { message: 'IndivSurveyScore eliminado' };
  }
}
