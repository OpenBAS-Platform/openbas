import type { ExerciseSimpleStore, ExerciseStore } from './Exercise';
import type { TeamStore } from '../teams/Team';
import type { Exercise, InjectExpectation, LessonsAnswer, LessonsCategory, LessonsQuestion, Objective } from '../../utils/api-types';

export interface ExercisesHelper {
  getExercise: (exerciseId: string) => ExerciseStore;
  getExercises: () => ExerciseSimpleStore[];
  getExercisesMap: () => Record<string, ExerciseStore>;
  getExerciseTeams: (exerciseId: string) => TeamStore[];
  getExerciseInjectExpectations: (exerciseId: Exercise['exercise_id']) => InjectExpectation[];
  getExerciseObjectives: (exerciseId: string) => Objective[];
  getExerciseLessonsCategories: (exerciseId: string) => LessonsCategory[];
  getExerciseLessonsQuestions: (exerciseId: string) => LessonsQuestion[];
  getExerciseLessonsAnswers: (exerciseId: string) => LessonsAnswer[];
  getExerciseUserLessonsAnswers: (exerciseId: string, userId: string) => LessonsAnswer[];
}
