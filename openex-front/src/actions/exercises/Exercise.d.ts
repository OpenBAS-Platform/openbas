import type { Exercise, Team, User } from '../../utils/api-types';

export type ExerciseTeamUserStore = Omit<Exercise['exercise_teams_users'], 'exercise_id', 'team_id', 'user_id'> & {
  exercise_id?: Exercise['exercise_id'];
  team_id?: Team['team_id'];
  user_id?: User['user_id'];
};

export type ExerciseStore = Omit<Exercise, 'exercise_tags', 'exercise_teams_users'> & {
  exercise_tags: string[] | undefined;
  exercise_teams_users: ExerciseTeamUserStore;
};
