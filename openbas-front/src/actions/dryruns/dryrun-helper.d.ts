import type { Dryrun } from '../../utils/api-types';

export interface DryRunHelper {
  getExerciseDryruns: (exerciseId: string) => Dryrun[];
}
