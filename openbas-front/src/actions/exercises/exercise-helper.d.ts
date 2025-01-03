import type { Exercise, InjectExpectation, LessonsAnswer, LessonsCategory, LessonsQuestion, Objective, Team } from '../../utils/api-types';
import type { ExerciseSimpleStore, ExerciseStore } from './Exercise';

export interface ExercisesHelper {
  getExercise: (exerciseId: string) => ExerciseStore;
  getExercises: () => ExerciseSimpleStore[];
  getExercisesMap: () => Record<string, ExerciseStore>;
  getExerciseTeams: (exerciseId: string) => Team[];
  getExerciseInjectExpectations: (exerciseId: Exercise['exercise_id']) => InjectExpectation[];
  getExerciseObjectives: (exerciseId: string) => Objective[];
  getExerciseLessonsCategories: (exerciseId: string) => LessonsCategory[];
  getExerciseLessonsQuestions: (exerciseId: string) => LessonsQuestion[];
  getExerciseLessonsAnswers: (exerciseId: string) => LessonsAnswer[];
  getExerciseUserLessonsAnswers: (exerciseId: string, userId: string) => LessonsAnswer[];
}
