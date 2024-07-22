import type { LessonsTemplateQuestion } from '../../utils/api-types';

export type LessonsTemplateQuestionStore = Omit<LessonsTemplateQuestion, 'lessons_template_question_category'> & {
  lessons_template_question_category: string;
};
