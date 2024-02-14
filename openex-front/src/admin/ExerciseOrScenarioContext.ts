import { createContext } from 'react';
import type { ArticleCreateInput, ArticleUpdateInput, Variable, VariableInput } from '../utils/api-types';
import type { ArticleStore, FullArticleStore } from '../actions/channels/Article';

export type PermissionsContext = {
  permissions: { readOnly: boolean, canWrite: boolean }
};

export type ArticleContext = {
  previewUrl: (article: FullArticleStore) => string;
  onAddArticle: (data: ArticleCreateInput) => string;
  onUpdateArticle: (article: ArticleStore, data: ArticleUpdateInput) => string;
  onDeleteArticle: (article: ArticleStore) => string;
} & PermissionsContext;

export type DocumentContext = {
  onInitDocument: () => {
    document_tags: { id: string, label: string }[],
    document_exercises: { id: string, label: string }[],
    document_scenarios: { id: string, label: string }[]
  }
};

export type VariableContext = {
  onCreateVariable: (data: VariableInput) => void,
  onEditVariable: (variable: Variable, data: VariableInput) => void,
  onDeleteVariable: (variable: Variable) => void,
} & PermissionsContext;

export type ExerciseOrScenario = ArticleContext & DocumentContext & VariableContext;

const ExerciseOrScenarioContext = createContext<ExerciseOrScenario | null>(null);

export default ExerciseOrScenarioContext;
