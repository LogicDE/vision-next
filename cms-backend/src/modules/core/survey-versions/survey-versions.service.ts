import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SurveyVersion } from '../../../entities/survey-version.entity';
import { Question } from '../../../entities/question.entity';
import { SurveyVersionQuestion } from '../../../entities/survey-version-question.entity';
import { QuestionI18n } from '../../../entities/question-i18n.entity';
import { CreateSurveyVersionDto } from './dto/create-survey-version.dto';
import { Survey } from '../../../entities/survey.entity';
import { Group } from '../../../entities/group.entity';

@Injectable()
export class SurveyVersionsService {
  private readonly templateSurveyName = '__TEMPLATE__';

  constructor(
    @InjectRepository(SurveyVersion)
    private readonly surveyVersionRepo: Repository<SurveyVersion>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(SurveyVersionQuestion)
    private readonly surveyVersionQuestionsRepo: Repository<SurveyVersionQuestion>,
    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

  private async getTemplateSurvey(): Promise<Survey> {
    let template = await this.surveyRepo.findOne({
      where: { name: this.templateSurveyName },
    });
    if (!template) {
      const group = await this.groupRepo.findOne({
        where: { isDeleted: false },
        order: { id: 'ASC' },
      });
      if (!group) {
        throw new NotFoundException('No hay grupos disponibles para crear la plantilla de encuestas');
      }
      template = await this.surveyRepo.save(
        this.surveyRepo.create({
          name: this.templateSurveyName,
          group,
        }),
      );
    }
    return template;
  }

  async create(dto: CreateSurveyVersionDto) {
    const questions = await this.questionRepo.findBy({ id: In(dto.questionIds) });
    if (questions.length !== dto.questionIds.length) {
      throw new NotFoundException('Algunas preguntas no fueron encontradas');
    }

    const templateSurvey = await this.getTemplateSurvey();
    const existingVersion = await this.surveyVersionRepo.findOne({
      where: {
        survey: { id: templateSurvey.id },
        versionNum: dto.versionNum,
      },
    });

    if (existingVersion) {
      throw new BadRequestException(`La versión ${dto.versionNum} ya existe`);
    }

    await this.surveyVersionRepo.update(
      { survey: { id: templateSurvey.id } },
      { active: false },
    );

    const version = this.surveyVersionRepo.create({
      survey: templateSurvey,
      versionNum: dto.versionNum,
      active: true,
      createdBy: undefined,
    });

    const savedVersion = await this.surveyVersionRepo.save(version);

    const links = dto.questionIds.map((questionId) =>
      this.surveyVersionQuestionsRepo.create({
        surveyVersion: savedVersion,
        question: { id: questionId } as Question,
      }),
    );

    await this.surveyVersionQuestionsRepo.save(links);
    return this.findOne(savedVersion.id);
  }

  async findAll() {
    const templateSurvey = await this.getTemplateSurvey();
    const versions = await this.surveyVersionRepo.find({
      relations: ['questions', 'questions.question', 'questions.question.i18nTexts'],
      where: {
        survey: { id: templateSurvey.id },
      },
      order: { versionNum: 'DESC' },
    });

    return versions.map((version) => ({
      id: version.id,
      versionNum: version.versionNum,
      active: version.active,
      createdAt: version.createdAt,
      questionCount: version.questions?.length ?? 0,
      questions: version.questions?.map((svq) => ({
        id: svq.question.id,
        text: svq.question.i18nTexts?.find((i18n: QuestionI18n) => i18n.locale === 'es')?.text || 'Sin texto',
        order: version.questions?.indexOf(svq) + 1,
      })) ?? [],
    }));
  }

  async getCurrentVersion() {
    const templateSurvey = await this.getTemplateSurvey();
    const currentVersion = await this.surveyVersionRepo.findOne({
      where: { active: true, survey: { id: templateSurvey.id } },
      relations: ['questions', 'questions.question', 'questions.question.i18nTexts'],
    });

    if (!currentVersion) return null;

    return {
      id: currentVersion.id,
      versionNum: currentVersion.versionNum,
      active: currentVersion.active,
      createdAt: currentVersion.createdAt,
      questionCount: currentVersion.questions?.length ?? 0,
      questions: currentVersion.questions?.map((svq) => ({
        id: svq.question.id,
        text: svq.question.i18nTexts?.find((i18n: QuestionI18n) => i18n.locale === 'es')?.text || 'Sin texto',
        order: currentVersion.questions?.indexOf(svq) + 1,
      })) ?? [],
    };
  }

  async setCurrentVersion(versionId: number) {
    const templateSurvey = await this.getTemplateSurvey();
    const version = await this.surveyVersionRepo.findOne({
      where: { id: versionId, survey: { id: templateSurvey.id } },
    });
    if (!version) throw new NotFoundException('Versión no encontrada');
    await this.surveyVersionRepo.update(
      { survey: { id: templateSurvey.id } },
      { active: false },
    );
    version.active = true;
    await this.surveyVersionRepo.save(version);
    return this.findOne(versionId);
  }

  async findOne(id: number) {
    const version = await this.surveyVersionRepo.findOne({
      where: { id },
      relations: ['questions', 'questions.question', 'questions.question.i18nTexts'],
    });
    if (!version) throw new NotFoundException('Versión no encontrada');
    return {
      id: version.id,
      versionNum: version.versionNum,
      active: version.active,
      createdAt: version.createdAt,
      questionCount: version.questions?.length ?? 0,
      questions: version.questions?.map((svq) => ({
        id: svq.question.id,
        text: svq.question.i18nTexts?.find((i18n: QuestionI18n) => i18n.locale === 'es')?.text || 'Sin texto',
        order: version.questions?.indexOf(svq) + 1,
      })) ?? [],
    };
  }

  async getCurrentVersionQuestionIds(): Promise<number[]> {
    const current = await this.getCurrentVersion();
    return current ? current.questions.map((q) => q.id) : [];
  }
}

