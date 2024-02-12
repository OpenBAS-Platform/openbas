import type { Challenge, Exercise, InjectExpectation, Organization, PlatformSetting, Tag, User } from '../utils/api-types';
import type { ScenarioStore } from './scenarios/Scenario';

export interface ExercicesHelper {
  getExercise: (exerciseId: Exercise['exercise_id']) => Exercise;
  getExerciseInjectExpectations: (exerciseId: Exercise['exercise_id']) => InjectExpectation[];
}

export interface ScenariosHelper {
  getScenario: (scenarioId: Scenario['scenario_id']) => Scenario;
  getScenarioTeams: (scenarioId: Scenario['scenario_id']) => Team[];
}

export interface UsersHelper {
  getMe: () => User;
}

export interface OrganizationsHelper {
  getOrganizationsMap: () => Record<string, Organization>;
}

export interface TagsHelper {
  getTag: (tagId: Tag['tag_id']) => Tag;
  getTags: () => Tag[];
  getTagsMap: () => Record<string, Tag>;
}

export interface LoggedHelper {
  // TODO type logged object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logged: () => any;
  getMe: () => User;
  getSettings: () => PlatformSetting;
}

export interface ChallengesHelper {
  getChallengesMap: () => Record<string, Challenge>;
  getExerciseChallenges: (exerciseId: Exercise['exercise_id']) => Challenge[];
  getScenarioChallenges: (scenarioId: ScenarioStore['scenario_id']) => Challenge[];
}

export interface DocumentsHelper {
  getDocumentsMap: () => Record<string, Document>
}
