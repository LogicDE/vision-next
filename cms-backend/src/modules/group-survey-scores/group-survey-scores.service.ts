import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupSurveyScore } from '../../entities/group-survey-score.entity';
import { Group } from '../../entities/group.entity';
import { CreateGroupSurveyScoreDto } from './dto/create-group-survey-score.dto';
import { UpdateGroupSurveyScoreDto } from './dto/update-group-survey-score.dto';

@Injectable()
export class GroupSurveyScoresService {
  constructor(
    @InjectRepository(GroupSurveyScore)
    private repo: Repository<GroupSurveyScore>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateGroupSurveyScoreDto) {
    const group = await this.groupRepo.findOneBy({ id: dto.groupId });
    if (!group) throw new NotFoundException('Group no encontrado');

    const survey = this.repo.create({
      group,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      groupScore: dto.groupScore,
    });

    return this.repo.save(survey);
  }

  findAll() {
    return this.repo.find({ relations: ['group', 'individualScores'] });
  }

  async findOne(id: number) {
    const survey = await this.repo.findOne({
      where: { id },
      relations: ['group', 'individualScores'],
    });
    if (!survey) throw new NotFoundException('GroupSurveyScore no encontrado');
    return survey;
  }

  async update(id: number, dto: UpdateGroupSurveyScoreDto) {
    const survey = await this.findOne(id);

    if (dto.groupId !== undefined) {
      const group = await this.groupRepo.findOneBy({ id: dto.groupId });
      if (!group) throw new NotFoundException('Group no encontrado');
      survey.group = group;
    }

    if (dto.startAt !== undefined) survey.startAt = new Date(dto.startAt);
    if (dto.endAt !== undefined) survey.endAt = new Date(dto.endAt);
    if (dto.groupScore !== undefined) survey.groupScore = dto.groupScore;

    return this.repo.save(survey);
  }

  async remove(id: number) {
    const survey = await this.findOne(id);
    await this.repo.remove(survey);
    return { message: 'GroupSurveyScore eliminado' };
  }
}
