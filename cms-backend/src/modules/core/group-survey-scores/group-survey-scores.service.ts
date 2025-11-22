import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from '../../../entities/survey.entity';
import { SurveyVersion } from '../../../entities/survey-version.entity';
import { Group } from '../../../entities/group.entity';
import { CreateGroupSurveyScoreDto } from './dto/create-group-survey-score.dto';
import { UpdateGroupSurveyScoreDto } from './dto/update-group-survey-score.dto';

@Injectable()
export class GroupSurveyScoresService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepo: Repository<Survey>,
    @InjectRepository(SurveyVersion)
    private versionRepo: Repository<SurveyVersion>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateGroupSurveyScoreDto) {
    const group = await this.groupRepo.findOneBy({ id: dto.groupId });
    if (!group) throw new NotFoundException('Group no encontrado');

    // Create survey
    const survey = this.surveyRepo.create({
      group,
      name: dto.name.trim(),
    });
    const savedSurvey = await this.surveyRepo.save(survey);

    // Create version 1 for this survey
    const version = this.versionRepo.create({
      survey: savedSurvey,
      versionNum: 1,
      groupScore: dto.groupScore ?? 0,
      active: true,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
    });
    const savedVersion = await this.versionRepo.save(version);

    return {
      ...savedSurvey,
      version: savedVersion,
    };
  }

  async findAll() {
    const surveys = await this.surveyRepo.find({
      where: { isDeleted: false },
      relations: ['group', 'group.manager', 'group.manager.enterprise', 'versions'],
    });
    // Return surveys with their active versions
    return surveys.map(survey => ({
      id: survey.id,
      group: survey.group,
      name: survey.name,
      createdAt: survey.createdAt,
      version: survey.versions?.find(v => v.active) || survey.versions?.[0],
    }));
  }

  async findOne(id: number) {
    const survey = await this.surveyRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['group', 'group.manager', 'group.manager.enterprise', 'versions'],
    });
    if (!survey) throw new NotFoundException('Survey no encontrado');
    return {
      ...survey,
      version: survey.versions?.find(v => v.active) || survey.versions?.[0],
    };
  }

  async update(id: number, dto: UpdateGroupSurveyScoreDto) {
    const survey = await this.surveyRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['versions'],
    });
    if (!survey) throw new NotFoundException('Survey no encontrado');

    if (dto.groupId !== undefined) {
      const group = await this.groupRepo.findOneBy({ id: dto.groupId });
      if (!group) throw new NotFoundException('Group no encontrado');
      survey.group = group;
    }

    if (dto.name !== undefined) survey.name = dto.name.trim();
    await this.surveyRepo.save(survey);

    // Update the active version
    const activeVersion = survey.versions?.find(v => v.active) || survey.versions?.[0];
    if (activeVersion) {
      if (dto.startAt !== undefined) activeVersion.startAt = new Date(dto.startAt);
      if (dto.endAt !== undefined) activeVersion.endAt = new Date(dto.endAt);
      if (dto.groupScore !== undefined) activeVersion.groupScore = dto.groupScore;
      await this.versionRepo.save(activeVersion);
    }

    return this.findOne(id);
  }

  async remove(id: number, deletedBy?: number) {
    const survey = await this.surveyRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!survey) throw new NotFoundException('Survey no encontrado');

    // Soft delete
    survey.isDeleted = true;
    if (deletedBy) {
      survey.deletedBy = { id: deletedBy } as any;
    }
    await this.surveyRepo.save(survey);
    return { message: 'Survey eliminado' };
  }
}
