import * as R from 'ramda';
import type { AttackPatternStore } from '../../actions/attackpattern/AttackPattern';
import type { InjectorContractStore } from '../../actions/injectorcontract/InjectorContract';

const computeAttackPattern = (contract: InjectorContractStore, attackPatternsMap: Record<string, AttackPatternStore>) => {
  const attackPatternParents = contract.injectors_contracts_attack_patterns?.map((attackPattern) => {
    const attackPatternParentId = attackPatternsMap[attackPattern]?.attack_pattern_parent;
    if (attackPatternParentId) {
      return attackPatternsMap[attackPatternParentId]?.attack_pattern_name;
    }
    return '';
  }).filter((name) => !R.isEmpty(name));

  if (!R.isEmpty(attackPatternParents)) {
    return attackPatternParents;
  }

  return contract.injectors_contracts_attack_patterns?.map((attackPattern) => {
    return attackPatternsMap[attackPattern]?.attack_pattern_name;
  });
};

export default computeAttackPattern;
