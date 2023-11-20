import { Exercise, User } from '../utils/api-types';

export interface ExercicesHelper {
  getExercise: (exerciseId: Exercise['exercise_id']) => Exercise
}

export interface UsersHelper {
  getMe: () => User
}
