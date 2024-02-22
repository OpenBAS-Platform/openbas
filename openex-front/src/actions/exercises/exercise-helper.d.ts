import type { ExerciseStore } from './Exercise';
import type { TeamStore } from '../teams/Team';

export interface ExercisesHelper {
  getExercise: (exerciseId: string) => ExerciseStore;
  getExercises: () => ExerciseStore[];
  getExerciseTeams: (exerciseId: string) => TeamStore[];
}
