import type { Challenge, Exercise, InjectExpectation, Organization, PlatformSetting, Tag, Team, User } from '../utils/api-types';

export interface ExercicesHelper {
  getExercise: (exerciseId: Exercise['exercise_id']) => Exercise;
  getExerciseInjectExpectations: (exerciseId: Exercise['exercise_id']) => InjectExpectation[];
}

export interface UsersHelper {
  getMe: () => User;
}

export interface OrganizationsHelper {
  getOrganizationsMap: () => Record<string, Organization>;
}

export interface TagsHelper {
  getTags: () => Tag[];
  getTagsMap: () => Record<string, Tag>;
}

export interface TeamsHelper {
  getExerciseTeams: (exerciseId: Exercise['exercise_id']) => Team[];
  getScenarioTeams: (exerciseId: Exercise['exercise_id']) => Team[];
  getTeamsMap: () => Record<string, Team>;
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
}

export interface DocumentsHelper {
  getDocumentsMap: () => Record<string, Document>
}
