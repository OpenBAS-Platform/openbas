import type { Audience, Exercise, Media, Organization, Tag, User } from '../utils/api-types';

export interface ExercicesHelper {
  getExercise: (exerciseId: Exercise['exercise_id']) => Exercise;
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
}

export interface MediasHelper {
  getMedia: (mediaId: Media['media_id']) => Media;
}

export interface LoggedHelper {
  // TODO type logged object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logged: () => any;
}
