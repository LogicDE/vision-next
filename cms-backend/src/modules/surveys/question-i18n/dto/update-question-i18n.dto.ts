import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionI18nDto } from './create-question-i18n.dto';

export class UpdateQuestionI18nDto extends PartialType(CreateQuestionI18nDto) {}
