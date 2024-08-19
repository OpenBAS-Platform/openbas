import type { ExerciseSimpleStore, ExerciseStore } from './Exercise';
import type { TeamStore } from '../teams/Team';
import type { Exercise, InjectExpectation } from '../../utils/api-types';

export interface ExercisesHelper {
  getExercise: (exerciseId: string) => ExerciseStore;
  getExercises: () => ExerciseSimpleStore[];
  getExercisesMap: () => Record<string, ExerciseStore>;
  getExerciseTeams: (exerciseId: string) => TeamStore[];
  getExerciseInjectExpectations: (exerciseId: Exercise['exercise_id']) => InjectExpectation[];
  getExerciseObjectives: (exerciseId: string) => ;
  getExerciseLessonsCategories: (exerciseId: string) => ;
  getExerciseLessonsQuestions: (exerciseId: string) => ;
  getExerciseLessonsAnswers: (exerciseId: string) => ;
}
