import type { Challenge, Exercise, Organization, PlatformSettings, Tag, User } from '../utils/api-types';
import type { ScenarioStore } from './scenarios/Scenario';

export interface UsersHelper {
  getMe: () => User;
  getUsersMap: () => Record<string, User>;
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
  getSettings: () => PlatformSettings;
  getPlatformSettings: () => PlatformSettings;
}

export interface ChallengesHelper {
  getChallengesMap: () => Record<string, Challenge>;
  getChallenges: () => Challenge[];
  getExerciseChallenges: (exerciseId: Exercise['exercise_id']) => Challenge[];
  getScenarioChallenges: (scenarioId: ScenarioStore['scenario_id']) => Challenge[];
}

export interface DocumentsHelper {
  getDocumentsMap: () => Record<string, Document>
}
