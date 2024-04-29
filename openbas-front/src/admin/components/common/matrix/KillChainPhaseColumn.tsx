import React, { FunctionComponent } from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { ExerciseInjectExpectationResultsByTypeStore } from '../../../../actions/exercises/Exercise';
import type { AttackPattern, KillChainPhase } from '../../../../utils/api-types';
import AttackPatternBox from './AttackPatternBox';
import type { AttackPatternStore } from '../../../../actions/attack_patterns/AttackPattern';

const useStyles = makeStyles(() => ({
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
}));

interface KillChainPhaseComponentProps {
  goToLink?: string;
  killChainPhase: KillChainPhase;
  attackPatterns: AttackPattern[];
  injectResults: ExerciseInjectExpectationResultsByTypeStore[];
}

const KillChainPhaseColumn: FunctionComponent<KillChainPhaseComponentProps> = ({
  goToLink,
  killChainPhase,
  attackPatterns,
  injectResults,
}) => {
  // Standard hooks
  const classes = useStyles();

  // Attack Pattern
  const sortAttackPattern = (attackPattern1: AttackPattern, attackPattern2: AttackPattern) => {
    if (attackPattern1.attack_pattern_name < attackPattern2.attack_pattern_name) {
      return -1;
    }
    if (attackPattern1.attack_pattern_name > attackPattern2.attack_pattern_name) {
      return 1;
    }
    return 0;
  };

  // Techniques
  const techniques = attackPatterns.filter((attackPattern) => attackPattern.attack_pattern_parent === null);

  // Inject Results
  const getInjectResult = (attack: AttackPatternStore) => {
    return injectResults.find((injectResult) => injectResult.inject_attack_pattern === attack.attack_pattern_id);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Typography variant="h3">{killChainPhase.phase_name}</Typography>
      <div className={classes.column}>
        {[...techniques].sort(sortAttackPattern)
          .map((attackPattern) => (
            <AttackPatternBox
              key={attackPattern.attack_pattern_id}
              goToLink={goToLink}
              attackPattern={attackPattern}
              injectResult={getInjectResult(attackPattern)}
            />
          ))}
      </div>
    </div>
  );
};

export default KillChainPhaseColumn;
