import type { AttackPattern } from '../../utils/api-types';

export type AttackPatternStore = Omit<AttackPattern, 'attack_pattern_kill_chain_phases', 'attack_pattern_parent'> & {
  attack_pattern_kill_chain_phases: string[] | undefined;
  attack_pattern_parent: string | undefined;
};
