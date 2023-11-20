import { Exercise, Organization, Tag, User } from '../utils/api-types';

export interface ExercicesHelper {
  getExercise: (exerciseId: Exercise['exercise_id']) => Exercise
}

export interface UsersHelper {
  getMe: () => User
}

export interface OrganizationsHelper {
  getOrganizationsMap: () => Record<string, Organization>
}

export interface TagsHelper {
  getTagsMap: () => Record<string, Tag>
}
