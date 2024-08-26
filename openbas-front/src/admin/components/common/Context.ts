import { createContext } from 'react';
import type { ArticleStore, FullArticleStore } from '../../../actions/channels/Article';
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
  EvaluationInput,
  ImportTestSummary,
  Inject,
  InjectsImportInput,
  LessonsAnswerCreateInput,
  LessonsCategory,
  LessonsCategoryCreateInput,
  LessonsCategoryTeamsInput,
  LessonsCategoryUpdateInput,
  LessonsQuestionCreateInput,
  LessonsQuestionUpdateInput,
  LessonsSendInput,
  ObjectiveInput,
  Team,
  TeamCreateInput,
  Variable,
  VariableInput,
} from '../../../utils/api-types';
import type { UserStore } from '../teams/players/Player';
import type { InjectStore } from '../../../actions/injects/Inject';

export type PermissionsContextType = {
  permissions: { readOnly: boolean, canWrite: boolean, isRunning: boolean }
};

export type ArticleContextType = {
  previewArticleUrl: (article: FullArticleStore) => string;
  onAddArticle: (data: ArticleCreateInput) => Promise<{ result: string }>;
  onUpdateArticle: (article: ArticleStore, data: ArticleUpdateInput) => string;
  onDeleteArticle: (article: ArticleStore) => string;
};

export type ChallengeContextType = {
  previewChallengeUrl: () => string
};

export type DocumentContextType = {
  onInitDocument: () => {
    document_tags: { id: string, label: string }[],
    document_exercises: { id: string, label: string }[],
    document_scenarios: { id: string, label: string }[]
  }
};

export type VariableContextType = {
  onCreateVariable: (data: VariableInput) => void,
  onEditVariable: (variable: Variable, data: VariableInput) => void,
  onDeleteVariable: (variable: Variable) => void,
};

export type TeamContextType = {
  onAddUsersTeam: (teamId: Team['team_id'], userIds: UserStore['user_id'][]) => Promise<void>,
  onRemoveUsersTeam: (teamId: Team['team_id'], userIds: UserStore['user_id'][]) => Promise<void>,
  onAddTeam?: (teamId: Team['team_id']) => Promise<void>,
  onCreateTeam?: (team: TeamCreateInput) => Promise<{ result: string }>,
  onRemoveTeam?: (teamId: Team['team_id']) => void,
  onToggleUser?: (teamId: Team['team_id'], userId: UserStore['user_id'], userEnabled: boolean) => void,
  checkUserEnabled?: (teamId: Team['team_id'], userId: UserStore['user_id']) => boolean,
  computeTeamUsersEnabled?: (teamId: Team['team_id']) => number,
};

export type InjectContextType = {
  onAddInject: (inject: Inject) => Promise<{ result: string }>,
  onUpdateInject: (injectId: Inject['inject_id'], inject: Inject) => Promise<{ result: string }>,
  onUpdateInjectTrigger?: (injectId: Inject['inject_id']) => void,
  onUpdateInjectActivation: (injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }) => Promise<{
    result: string,
    entities: { injects: Record<string, InjectStore> }
  }>,
  onInjectDone?: (injectId: Inject['inject_id']) => void,
  onDeleteInject: (injectId: Inject['inject_id']) => void,
  onImportInjectFromXls?: (importId: string, input: InjectsImportInput) => Promise<ImportTestSummary>
  onDryImportInjectFromXls?: (importId: string, input: InjectsImportInput) => Promise<ImportTestSummary>
};

export type AtomicTestingContextType = {
  onAddAtomicTesting: (inject: Inject) => Promise<{ result: string }>,
};
export type AtomicTestingResultContextType = {
  onLaunchAtomicTesting: () => void;
};
export type LessonContextType = {
  onApplyLessonsTemplate: (data: string) => Promise<LessonsCategory[]>,
  onResetLessonsAnswers: () => Promise<LessonsCategory[]>,
  onEmptyLessonsCategories: () => Promise<LessonsCategory[]>,
  onUpdateSourceLessons: (data: boolean) => Promise<LessonsCategory>,
  onSendLessons?: (data: LessonsSendInput) => Promise<{ result: string }>,
  onAddLessonsCategory: (data: LessonsCategoryCreateInput) => Promise<{ result: string }>,
  onDeleteLessonsCategory: (data: string) => void,
  onUpdateLessonsCategory: (lessonCategoryId: string, data: LessonsCategoryUpdateInput) => Promise<LessonsCategory>
  onUpdateLessonsCategoryTeams: (lessonCategoryId: string, data: LessonsCategoryTeamsInput) => Promise<LessonsCategory>
  onDeleteLessonsQuestion: (lessonsCategoryId: string, lessonsQuestionId: string) => Promise<{ result: string }>,
  onUpdateLessonsQuestion: (lessonsCategoryId: string, lessonsQuestionId: string, data: LessonsQuestionUpdateInput) => Promise<{
    result: string
  }>,
  onAddLessonsQuestion: (lessonsCategoryId: string, data: LessonsQuestionCreateInput) => Promise<{ result: string }>,
  onAddObjective: (data: ObjectiveInput) => Promise<{ result: string }>,
  onUpdateObjective: (objectiveId: string, data: ObjectiveInput) => Promise<{ result: string }>,
  onDeleteObjective: (objectiveId: string) => Promise<{ result: string }>,
  onAddEvaluation: (objectiveId: string, data: EvaluationInput) => Promise<{ result: string }>,
  onUpdateEvaluation: (objectiveId: string, evaluationId: string, data: EvaluationInput) => Promise<{ result: string }>,
  onFetchEvaluation: (objectiveId: string) => void,
};
export type ViewLessonContextType = {
  onAddLessonsAnswers: (questionCategory: string, lessonsQuestionId: string, answerData: LessonsAnswerCreateInput) => void,
  onFetchPlayerLessonsAnswers: () => void,
};

export const PermissionsContext = createContext<PermissionsContextType>({
  permissions: { canWrite: false, readOnly: false, isRunning: false },
});
export const ArticleContext = createContext<ArticleContextType>({
  onAddArticle(_data: ArticleCreateInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onDeleteArticle(_article: ArticleStore): string {
    return '';
  },
  onUpdateArticle(_article: ArticleStore, _data: ArticleUpdateInput): string {
    return '';
  },
  previewArticleUrl(_article: FullArticleStore): string {
    return '';
  },
});
export const ChallengeContext = createContext<ChallengeContextType>({
  previewChallengeUrl(): string {
    return '';
  },
});
export const DocumentContext = createContext<DocumentContextType>({
  onInitDocument(): {
    document_tags: { id: string; label: string }[];
    document_exercises: { id: string; label: string }[];
    document_scenarios: { id: string; label: string }[]
  } {
    return { document_exercises: [], document_scenarios: [], document_tags: [] };
  },
});
export const VariableContext = createContext<VariableContextType>({
  onCreateVariable(_data: VariableInput): void {
  },
  onDeleteVariable(_variable: Variable): void {
  },
  onEditVariable(_variable: Variable, _data: VariableInput): void {
  },
});
export const TeamContext = createContext<TeamContextType>({
  onAddUsersTeam(_teamId: Team['team_id'], _userIds: UserStore['user_id'][]): Promise<void> {
    return new Promise<void>(() => {
    });
  },
  onRemoveUsersTeam(_teamId: Team['team_id'], _userIds: UserStore['user_id'][]): Promise<void> {
    return new Promise<void>(() => {
    });
  },
});
export const InjectContext = createContext<InjectContextType>({
  onAddInject(_inject: Inject): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onUpdateInject(_injectId: Inject['inject_id'], _inject: Inject): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onUpdateInjectTrigger(_injectId: Inject['inject_id']): void {
  },
  onUpdateInjectActivation(_injectId: Inject['inject_id'], _injectEnabled: { inject_enabled: boolean }): Promise<{
    result: string,
    entities: { injects: Record<string, InjectStore> }
  }> {
    return Promise.resolve({ result: '', entities: { injects: {} } });
  },
  onInjectDone(_injectId: Inject['inject_id']): void {
  },
  onDeleteInject(_injectId: Inject['inject_id']): void {
  },
  onImportInjectFromXls(_importId: string, _input: InjectsImportInput): Promise<ImportTestSummary> {
    return new Promise<ImportTestSummary>(() => {
    });
  },
  onDryImportInjectFromXls(_importId: string, _input: InjectsImportInput): Promise<ImportTestSummary> {
    return new Promise<ImportTestSummary>(() => {
    });
  },
});
export const LessonContext = createContext<LessonContextType>({
  onApplyLessonsTemplate(_data: string): Promise<LessonsCategory[]> {
    return new Promise<LessonsCategory[]>(() => {});
  },
  onResetLessonsAnswers(): Promise<LessonsCategory[]> {
    return new Promise<LessonsCategory[]>(() => {});
  },
  onEmptyLessonsCategories(): Promise<LessonsCategory[]> {
    return new Promise<LessonsCategory[]>(() => {});
  },
  onUpdateSourceLessons(_data: boolean): Promise<LessonsCategory> {
    return new Promise<LessonsCategory>(() => {});
  },
  onSendLessons(_data: LessonsSendInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onAddLessonsCategory(_data: LessonsCategoryCreateInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onDeleteLessonsCategory(_data: string): void {
  },
  onUpdateLessonsCategory(_lessonCategoryId: string, _data: LessonsCategoryUpdateInput): Promise<LessonsCategory> {
    return new Promise<LessonsCategory>(() => {});
  },
  onUpdateLessonsCategoryTeams(_lessonCategoryId: string, _data: LessonsCategoryTeamsInput): Promise<LessonsCategory> {
    return new Promise<LessonsCategory>(() => {});
  },
  onDeleteLessonsQuestion(_lessonsCategoryId: string, _lessonsQuestionId: string): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onUpdateLessonsQuestion(_lessonsCategoryId: string, _lessonsQuestionId: string, _data: LessonsQuestionUpdateInput): Promise<{
    result: string
  }> {
    return Promise.resolve({ result: '' });
  },
  onAddLessonsQuestion(_lessonsCategoryId: string, _data: LessonsQuestionCreateInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onAddObjective(_data: ObjectiveInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onUpdateObjective(_objectiveId: string, _data: ObjectiveInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onDeleteObjective(_objectiveId: string): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onAddEvaluation(_objectiveId: string, _data: EvaluationInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onUpdateEvaluation(_objectiveId: string, _evaluationId: string, _data: EvaluationInput): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
  onFetchEvaluation(_objectiveId: string): void {
  },
});
export const ViewLessonContext = createContext<ViewLessonContextType>({
  onAddLessonsAnswers(_questionCategory: string, _lessonsQuestionId: string, _answerData: LessonsAnswerCreateInput): void {
  },
  onFetchPlayerLessonsAnswers(): void {
  },
});
