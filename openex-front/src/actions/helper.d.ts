import type { Audience, Exercise, InjectExpectation, Media, Organization, Tag, User } from '../utils/api-types';

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
  getTagsMap: () => Record<string, Tag>;
}

export interface AudiencesHelper {
  getExerciseAudiences: (exerciseId: Exercise['exercise_id']) => Audience[];
  getAudiencesMap: () => Record<string, Audience>;
}

export interface MediasHelper {
  getMedia: (mediaId: Media['media_id']) => Media;
}

export interface LoggedHelper {
  // TODO type logged object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logged: () => any;
}
