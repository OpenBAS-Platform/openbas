import type { Exercise, ExerciseInjectExpectationResultsByType, ExerciseSimple, InjectExpectationResultsByType, Team, User } from '../../utils/api-types';

export type ExerciseTeamUserStore = Omit<Exercise['exercise_teams_users'], 'exercise_id', 'team_id', 'user_id'> & {
  exercise_id?: Exercise['exercise_id'];
  team_id?: Team['team_id'];
  user_id?: User['user_id'];
};

export type ExerciseStore = Omit<Exercise, 'exercise_tags', 'exercise_teams_users'> & {
  exercise_tags: string[] | undefined;
  exercise_teams_users: ExerciseTeamUserStore;
};

export type ExerciseSimpleStore = Omit<ExerciseSimple, 'exercise_tags'> & {
  exercise_tags: string[] | undefined;
};

export type InjectExpectationResultsByTypeStore = Omit<InjectExpectationResultsByType, 'inject'> & {
  inject: string | undefined
};

export type ExerciseInjectExpectationResultsByTypeStore = Omit<ExerciseInjectExpectationResultsByType, 'exercise_inject_results_attack_pattern' | 'exercise_inject_results_injects'> & {
  exercise_inject_results_attack_pattern: string[] | undefined;
  exercise_inject_results_results: InjectExpectationResultsByTypeStore[] | undefined;
};
