import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndivSurveyScore } from '../../../entities/indiv-survey-score.entity';
import { SurveyVersion } from '../../../entities/survey-version.entity';
import { Employee } from '../../../entities/employee.entity';
import { CreateIndivSurveyScoreDto } from './dto/create-indiv-survey-score.dto';
import { UpdateIndivSurveyScoreDto } from './dto/update-indiv-survey-score.dto';

@Injectable()
export class IndivSurveyScoresService {
  constructor(
    @InjectRepository(IndivSurveyScore)
    private repo: Repository<IndivSurveyScore>,
    @InjectRepository(SurveyVersion)
    private surveyVersionRepo: Repository<SurveyVersion>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateIndivSurveyScoreDto) {
    const surveyVersion = await this.surveyVersionRepo.findOneBy({ id: dto.surveyVersionId });
    if (!surveyVersion) throw new NotFoundException('Survey version no encontrada');

    const employee = await this.employeeRepo.findOneBy({ id: dto.employeeId });
    if (!employee) throw new NotFoundException('Employee no encontrado');

    const score = this.repo.create({
      surveyVersion,
      employee,
      submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : undefined,
      indivScore: dto.indivScore,
    });

    return this.repo.save(score);
  }

  findAll() {
    return this.repo.find({ relations: ['surveyVersion', 'employee'] });
  }

  async findOne(id: number) {
    const score = await this.repo.findOne({
      where: { id },
      relations: ['surveyVersion', 'employee'],
    });
    if (!score) throw new NotFoundException('IndivSurveyScore no encontrado');
    return score;
  }

  async update(id: number, dto: UpdateIndivSurveyScoreDto) {
    const score = await this.findOne(id);

    if (dto.surveyVersionId !== undefined) {
      const surveyVersion = await this.surveyVersionRepo.findOneBy({ id: dto.surveyVersionId });
      if (!surveyVersion) throw new NotFoundException('Survey version no encontrada');
      score.surveyVersion = surveyVersion;
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
