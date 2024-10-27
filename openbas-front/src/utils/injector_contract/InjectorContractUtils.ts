import * as R from 'ramda';

import type { AttackPatternStore } from '../../actions/attack_patterns/AttackPattern';
import type { InjectorContractOutput } from '../api-types';

const computeAttackPatterns = (contract: InjectorContractOutput, attackPatternsMap: Record<string, AttackPatternStore>) => {
  const attackPatternParents = (contract.injector_contract_attack_patterns ?? []).flatMap((attackPattern) => {
    const attackPatternParentId = attackPatternsMap[attackPattern]?.attack_pattern_parent;
    if (attackPatternParentId) {
      return [attackPatternsMap[attackPatternParentId]];
    }
    return [];
  });
  if (!R.isEmpty(attackPatternParents)) {
    return attackPatternParents;
  }
  return (contract.injector_contract_attack_patterns ?? []).map((attackPattern) => {
    return attackPatternsMap[attackPattern];
  });
};

export default computeAttackPatterns;
