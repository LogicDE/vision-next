import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IndivSurveyScore } from '../../../entities/indiv-survey-score.entity';
import { SurveyVersion } from '../../../entities/survey-version.entity';
import { Survey } from '../../../entities/survey.entity';
import { Employee } from '../../../entities/employee.entity';
import { GroupEmployee } from '../../../entities/group-employee.entity';
import { ResponseAnswer } from '../../../entities/response-answer.entity';
import { SurveyVersionQuestion } from '../../../entities/survey-version-question.entity';
import { QuestionI18n } from '../../../entities/question-i18n.entity';
import { CreateIndivSurveyScoreDto } from './dto/create-indiv-survey-score.dto';
import { UpdateIndivSurveyScoreDto } from './dto/update-indiv-survey-score.dto';
import { SubmitSurveyDto } from './dto/submit-survey.dto';

@Injectable()
export class IndivSurveyScoresService {
  constructor(
    @InjectRepository(IndivSurveyScore)
    private repo: Repository<IndivSurveyScore>,
    @InjectRepository(SurveyVersion)
    private surveyVersionRepo: Repository<SurveyVersion>,
    @InjectRepository(Survey)
    private surveyRepo: Repository<Survey>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(GroupEmployee)
    private groupEmployeeRepo: Repository<GroupEmployee>,
    @InjectRepository(ResponseAnswer)
    private responseAnswerRepo: Repository<ResponseAnswer>,
    @InjectRepository(SurveyVersionQuestion)
    private surveyVersionQuestionRepo: Repository<SurveyVersionQuestion>,
    @InjectRepository(QuestionI18n)
    private questionI18nRepo: Repository<QuestionI18n>,
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

  async getAssignedSurveys(employeeId: number, page: number = 1, limit: number = 10) {
    // Get employee's groups (only non-deleted groups)
    const groupMemberships = await this.groupEmployeeRepo.find({
      where: { employeeId },
      relations: ['group'],
    });
    
    // Filter to only include non-deleted groups
    const validGroupMemberships = groupMemberships.filter(gm => gm.group && !gm.group.isDeleted);
    const groupIds = validGroupMemberships.map(gm => gm.groupId);

    if (groupIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
      };
    }

    // Get surveys for these groups (only non-deleted surveys)
    const allSurveys = await this.surveyRepo.find({
      where: {
        group: { id: In(groupIds) },
        isDeleted: false,
      },
      relations: ['group', 'versions', 'versions.questions', 'versions.questions.question', 'versions.questions.question.i18nTexts'],
      order: { createdAt: 'DESC' },
    });

    // Filter to only include surveys from non-deleted groups
    const surveys = allSurveys.filter(s => !s.group.isDeleted);
    const total = surveys.length;
    
    // Apply pagination after filtering
    const paginatedSurveys = surveys.slice((page - 1) * limit, page * limit);

    // Get employee's existing survey scores
    const existingScores = await this.repo.find({
      where: { employee: { id: employeeId } },
      relations: ['surveyVersion'],
    });
    const answeredVersionIds = new Set(existingScores.map(s => s.surveyVersion.id));

    // Format surveys with their active versions and questions
    const now = new Date();
    const REQUIRED_QUESTION_COUNT = 5;
    const formattedSurveys = paginatedSurveys
      .flatMap(survey => {
        return survey.versions
          .filter(v => !v.isDeleted)
          .flatMap(version => {
            const questions = (version.questions || [])
              .filter(svq => svq.question && !svq.question.isDeleted)
              .map(svq => {
                const question = svq.question;
                if (!question) {
                  return {
                    id: svq.id,
                    text: `Question ${svq.id}`,
                  };
                }
                const i18nText = question.i18nTexts?.find(i => i.locale === 'es') ||
                                question.i18nTexts?.[0];
                return {
                  id: svq.id,
                  text: i18nText?.text || `Question ${question.id}`,
                };
              })
              .sort((a, b) => a.id - b.id);

            if (questions.length !== REQUIRED_QUESTION_COUNT) {
              return [];
            }

            const isActive = version.active &&
              (!version.startAt || version.startAt <= now) &&
              (!version.endAt || version.endAt >= now);

            const isAnswered = answeredVersionIds.has(version.id);
            const existingScore = existingScores.find(s => s.surveyVersion.id === version.id);

            return [{
              id: survey.id,
              surveyVersionId: version.id,
              name: survey.name,
              startAt: version.startAt?.toISOString() || null,
              endAt: version.endAt?.toISOString() || null,
              groupScore: version.groupScore || null,
              group: {
                id: survey.group.id,
                name: survey.group.name,
              },
              answered: isAnswered,
              indivScore: existingScore?.indivScore || null,
              submittedAt: existingScore?.submittedAt?.toISOString() || null,
              questions,
              isActive,
            }];
          });
      })
      .sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        const aStart = a.startAt ? new Date(a.startAt).getTime() : 0;
        const bStart = b.startAt ? new Date(b.startAt).getTime() : 0;
        return bStart - aStart;
      });

    // Calculate total count of all survey versions (for pagination)
    const totalVersions = surveys.reduce((count, survey) => {
      const valid = survey.versions
        .filter(v => !v.isDeleted)
        .filter(version => {
          const questions = (version.questions || [])
            .filter(svq => svq.question && !svq.question.isDeleted);
          return questions.length === REQUIRED_QUESTION_COUNT;
        });
      return count + valid.length;
    }, 0);

    return {
      items: formattedSurveys,
      total: totalVersions,
      page,
      limit,
    };
  }

  async submitSurvey(employeeId: number, dto: SubmitSurveyDto) {
    // Get survey version
    const surveyVersion = await this.surveyVersionRepo.findOne({
      where: { id: dto.surveyVersionId },
      relations: ['questions', 'questions.question'],
    });
    if (!surveyVersion) {
      throw new NotFoundException('Survey version no encontrada');
    }

    // Check if already answered
    const existing = await this.repo.findOne({
      where: {
        employee: { id: employeeId },
        surveyVersion: { id: dto.surveyVersionId },
      },
    });
    if (existing) {
      throw new BadRequestException('Esta encuesta ya fue respondida');
    }

    // Validate answers count matches questions count
    const questions = surveyVersion.questions.sort((a, b) => a.id - b.id);
    if (dto.answers.length !== questions.length) {
      throw new BadRequestException(`Se esperaban ${questions.length} respuestas, se recibieron ${dto.answers.length}`);
    }

    // Calculate average score (rounded to integer)
    const average = dto.answers.reduce((sum, val) => sum + val, 0) / dto.answers.length;
    const indivScore = Math.round(average);

    // Get employee
    const employee = await this.employeeRepo.findOneBy({ id: employeeId });
    if (!employee) {
      throw new NotFoundException('Employee no encontrado');
    }

    // Create IndivSurveyScore
    const score = this.repo.create({
      surveyVersion,
      employee,
      submittedAt: new Date(),
      indivScore,
    });
    const savedScore = await this.repo.save(score);

    // Create ResponseAnswer records
    const responseAnswers = questions.map((svq, index) => {
      return this.responseAnswerRepo.create({
        indivScore: savedScore,
        surveyQuestion: svq,
        answerValue: dto.answers[index],
      });
    });
    await this.responseAnswerRepo.save(responseAnswers);

    return {
      id: savedScore.id,
      surveyVersionId: dto.surveyVersionId,
      indivScore: savedScore.indivScore,
      submittedAt: savedScore.submittedAt?.toISOString() || null,
    };
  }
}
