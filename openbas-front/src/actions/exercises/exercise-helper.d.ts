import type { Exercise, ExerciseSimple, InjectExpectation, LessonsAnswer, LessonsCategory, LessonsQuestion, Objective, Team } from '../../utils/api-types';

export interface ExercisesHelper {
  getExercise: (exerciseId: string) => Exercise;
  getExercises: () => ExerciseSimple[];
  getExercisesMap: () => Record<string, Exercise>;
  getExerciseTeams: (exerciseId: string) => Team[];
  getExerciseInjectExpectations: (exerciseId: Exercise['exercise_id']) => InjectExpectation[];
  getExerciseObjectives: (exerciseId: string) => Objective[];
  getExerciseLessonsCategories: (exerciseId: string) => LessonsCategory[];
  getExerciseLessonsQuestions: (exerciseId: string) => LessonsQuestion[];
  getExerciseLessonsAnswers: (exerciseId: string) => LessonsAnswer[];
  getExerciseUserLessonsAnswers: (exerciseId: string, userId: string) => LessonsAnswer[];
}
