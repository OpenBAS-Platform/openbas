import { createContext } from 'react';
import type { ArticleStore, FullArticleStore } from '../../../actions/channels/Article';
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
  Inject,
  InjectsImportInput,
  Team,
  TeamCreateInput,
  Variable,
  VariableInput,
  ImportTestSummary,
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
  onInitDocument(): { document_tags: { id: string; label: string }[]; document_exercises: { id: string; label: string }[]; document_scenarios: { id: string; label: string }[] } {
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
export const AtomicTestingContext = createContext<AtomicTestingContextType>({
  onAddAtomicTesting(_inject: Inject): Promise<{ result: string }> {
    return Promise.resolve({ result: '' });
  },
});
export const AtomicTestingResultContext = createContext<AtomicTestingResultContextType>({
  onLaunchAtomicTesting: () => {
  },
});
export const LessonContext = createContext<LessonContextType>({
});
