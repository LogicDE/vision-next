import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Survey } from '../../../entities/survey.entity';
import { SurveyVersion } from '../../../entities/survey-version.entity';
import { Question } from '../../../entities/question.entity';
import { SurveyVersionQuestion } from '../../../entities/survey-version-question.entity';
import { QuestionI18n } from '../../../entities/question-i18n.entity';
import { Group } from '../../../entities/group.entity';
import { CreateSurveyVersionDto } from './dto/create-survey-version.dto';

const TEMPLATE_SURVEY_NAME = '__TEMPLATE__';

@Injectable()
export class SurveyVersionsService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepo: Repository<Survey>,
    @InjectRepository(SurveyVersion)
    private surveyVersionRepo: Repository<SurveyVersion>,
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(SurveyVersionQuestion)
    private surveyVersionQuestionsRepo: Repository<SurveyVersionQuestion>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  private async getOrCreateTemplateSurvey(): Promise<Survey> {
    // Find or create a special template survey (not tied to any group)
    // We'll use a special group ID 0 or create a dummy group
    let templateSurvey = await this.surveyRepo.findOne({
      where: { name: TEMPLATE_SURVEY_NAME },
      relations: ['versions', 'versions.questions', 'versions.questions.question'],
    });

    if (!templateSurvey) {
      // Create a dummy group for the template survey if needed
      // Actually, we need a group. Let's find the first group or create one
      const groups = await this.groupRepo.find({ 
        order: { id: 'ASC' }, 
        take: 1 
      });
      const firstGroup = groups.length > 0 ? groups[0] : null;
      if (!firstGroup) {
        throw new BadRequestException('No hay grupos disponibles. Crea al menos un grupo primero.');
      }

      templateSurvey = this.surveyRepo.create({
        name: TEMPLATE_SURVEY_NAME,
        group: firstGroup, // Use first group as placeholder
      });
      templateSurvey = await this.surveyRepo.save(templateSurvey);
      
      // Reload with relations
      templateSurvey = await this.surveyRepo.findOne({
        where: { id: templateSurvey.id },
        relations: ['versions', 'versions.questions', 'versions.questions.question'],
      });
    }

    return templateSurvey!;
  }

  async create(dto: CreateSurveyVersionDto) {
    // Validate questions exist
    const questions = await this.questionRepo.findBy({
      id: In(dto.questionIds),
    });
    if (questions.length !== dto.questionIds.length) {
      throw new NotFoundException('Algunas preguntas no fueron encontradas');
    }

    const templateSurvey = await this.getOrCreateTemplateSurvey();

    // Check if version number already exists
    const existingVersion = await this.surveyVersionRepo.findOne({
      where: {
        survey: { id: templateSurvey.id },
        versionNum: dto.versionNum,
      },
    });
    if (existingVersion) {
      throw new BadRequestException(`La versión ${dto.versionNum} ya existe`);
    }

    // Deactivate all other versions
    await this.surveyVersionRepo.update(
      { survey: { id: templateSurvey.id } },
      { active: false },
    );

    // Create new version
    const version = this.surveyVersionRepo.create({
      survey: templateSurvey,
      versionNum: dto.versionNum,
      active: true, // New version becomes the current one
      createdBy: undefined, // TODO: Get from auth context
    });

    const savedVersion = await this.surveyVersionRepo.save(version);

    // Link questions
    const questionLinks = dto.questionIds.map((questionId) =>
      this.surveyVersionQuestionsRepo.create({
        surveyVersion: savedVersion,
        question: { id: questionId } as Question,
      }),
    );
    await this.surveyVersionQuestionsRepo.save(questionLinks);

    return this.findOne(savedVersion.id);
  }

  async findAll() {
    try {
      const templateSurvey = await this.getOrCreateTemplateSurvey();
      const versions = await this.surveyVersionRepo.find({
        where: { survey: { id: templateSurvey.id } },
        relations: ['questions', 'questions.question', 'questions.question.i18nTexts'],
        order: { versionNum: 'DESC' },
      });

      return versions.map((v: SurveyVersion) => ({
        id: v.id,
        versionNum: v.versionNum,
        active: v.active,
        createdAt: v.createdAt,
        questionCount: v.questions?.length ?? 0,
        questions: v.questions?.map((svq: SurveyVersionQuestion) => ({
          id: svq.question.id,
          text: svq.question.i18nTexts?.find((i18n: QuestionI18n) => i18n.locale === 'es')?.text || 'Sin texto',
          order: v.questions?.indexOf(svq) + 1,
        })) ?? [],
      }));
    } catch (error: any) {
      // If template survey doesn't exist or error, return empty array
      console.error('Error in findAll survey versions:', error);
      return [];
    }
  }

  async getCurrentVersion() {
    try {
      const templateSurvey = await this.getOrCreateTemplateSurvey();
      const currentVersion = await this.surveyVersionRepo.findOne({
        where: {
          survey: { id: templateSurvey.id },
          active: true,
        },
        relations: ['questions', 'questions.question', 'questions.question.i18nTexts'],
        order: { versionNum: 'DESC' },
      });

      if (!currentVersion) {
        return null;
      }

      return {
        id: currentVersion.id,
        versionNum: currentVersion.versionNum,
        active: currentVersion.active,
        createdAt: currentVersion.createdAt,
        questionCount: currentVersion.questions?.length ?? 0,
        questions: currentVersion.questions?.map((svq: SurveyVersionQuestion) => ({
          id: svq.question.id,
          text: svq.question.i18nTexts?.find((i18n: QuestionI18n) => i18n.locale === 'es')?.text || 'Sin texto',
          order: currentVersion.questions?.indexOf(svq) + 1,
        })) ?? [],
      };
    } catch (error: any) {
      // If template survey doesn't exist or error, return null
      console.error('Error in getCurrentVersion:', error);
      return null;
    }
  }

  async setCurrentVersion(versionId: number) {
    const version = await this.surveyVersionRepo.findOne({
      where: { id: versionId },
      relations: ['survey'],
    });
    if (!version) {
      throw new NotFoundException('Versión no encontrada');
    }

    const templateSurvey = await this.getOrCreateTemplateSurvey();
    if (version.survey.id !== templateSurvey.id) {
      throw new BadRequestException('Esta versión no pertenece al template de encuestas');
    }

    // Deactivate all versions
    await this.surveyVersionRepo.update(
      { survey: { id: templateSurvey.id } },
      { active: false },
    );

    // Activate selected version
    version.active = true;
    await this.surveyVersionRepo.save(version);

    return this.findOne(versionId);
  }

  async findOne(id: number) {
    const version = await this.surveyVersionRepo.findOne({
      where: { id },
      relations: ['questions', 'questions.question', 'questions.question.i18nTexts', 'survey'],
    });
    if (!version) {
      throw new NotFoundException('Versión no encontrada');
    }

    return {
      id: version.id,
      versionNum: version.versionNum,
      active: version.active,
      createdAt: version.createdAt,
      questionCount: version.questions?.length ?? 0,
      questions: version.questions?.map((svq: SurveyVersionQuestion) => ({
        id: svq.question.id,
        text: svq.question.i18nTexts?.find((i18n: QuestionI18n) => i18n.locale === 'es')?.text || 'Sin texto',
        order: version.questions?.indexOf(svq) + 1,
      })) ?? [],
    };
  }

  async getCurrentVersionQuestionIds(): Promise<number[]> {
    const current = await this.getCurrentVersion();
    if (!current) {
      return [];
    }
    return current.questions.map((q: { id: number }) => q.id);
  }
}

