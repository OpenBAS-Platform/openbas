import { createContext } from 'react';
import type { ArticleCreateInput, ArticleUpdateInput,Exercise, Team, TeamCreateInput, TeamUpdateInput, Variable, VariableInput } from '../utils/api-types';
import type { ArticleStore, FullArticleStore } from '../actions/channels/Article';
import type { ScenarioStore } from '../actions/scenarios/Scenario';

export type PermissionsContext = {
  permissions: { readOnly: boolean, canWrite: boolean }
};

export type ArticleContext = {
  previewArticleUrl: (article: FullArticleStore) => string;
  onAddArticle: (data: ArticleCreateInput) => string;
  onUpdateArticle: (article: ArticleStore, data: ArticleUpdateInput) => string;
  onDeleteArticle: (article: ArticleStore) => string;
} & PermissionsContext;

export type ChallengeContext = {
  previewChallengeUrl: () => string
}

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

export type TeamContext = {
  onAddTeams: (teamIds: Team['team_id'][]) => void,
  onCreateTeam: (team: TeamCreateInput) => Promise<() => ({ result: { result: string } })>,
  onEditTeam: (teamId: Team['team_id'], data: TeamUpdateInput) => void,
  onRemoveTeamFromExerciseScenario: (teamId: Team['team_id']) => void,
  exerciseScenarioName: Exercise['exercise_name'] | ScenarioStore['scenario_name'],
  isContextual: boolean,
} & PermissionsContext;

export type ExerciseOrScenario = ArticleContext & ChallengeContext & DocumentContext & VariableContext & TeamContext;

const ExerciseOrScenarioContext = createContext<ExerciseOrScenario | null>(null);

export default ExerciseOrScenarioContext;
