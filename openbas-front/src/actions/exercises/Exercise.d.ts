import type { Exercise, ExerciseSimple, InjectExpectationResultsByAttackPattern, InjectExpectationResultsByType, Team, User } from '../../utils/api-types';

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
  inject: string | undefined;
};

export type InjectExpectationResultsByAttackPatternStore = Omit<InjectExpectationResultsByAttackPattern, 'inject_attack_pattern' | 'exercise_inject_results_injects'> & {
  inject_attack_pattern: string[] | undefined;
  inject_expectation_results: InjectExpectationResultsByTypeStore[] | undefined;
};
