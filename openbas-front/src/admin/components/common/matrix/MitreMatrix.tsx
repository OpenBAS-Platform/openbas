import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import type { AttackPatternHelper } from '../../../../actions/attack_patterns/attackpattern-helper';
import type { KillChainPhaseHelper } from '../../../../actions/kill_chain_phases/killchainphase-helper';
import { fetchKillChainPhases } from '../../../../actions/KillChainPhase';
import { fetchAttackPatterns } from '../../../../actions/AttackPattern';
import { useAppDispatch } from '../../../../utils/hooks';
import type { AttackPattern, KillChainPhase } from '../../../../utils/api-types';
import type { AttackPatternStore } from '../../../../actions/attack_patterns/AttackPattern';
import type { InjectExpectationResultsByAttackPatternStore } from '../../../../actions/exercises/Exercise';
import KillChainPhaseColumn from './KillChainPhaseColumn';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
    display: 'flex',
    gap: 20,
    overflowX: 'auto',
    animation: 'detect-scroll linear',
    animationTimeline: 'scroll(self inline)',
  },
}));

interface Props {
  goToLink?: string;
  injectResults: InjectExpectationResultsByAttackPatternStore[];
  ttpAlreadyLoaded?: boolean;
}

const MitreMatrix: FunctionComponent<Props> = ({
  goToLink,
  injectResults,
  ttpAlreadyLoaded,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Fetching data
  const { attackPatternMap, killChainPhaseMap }: {
    attackPatternMap: Record<string, AttackPattern>,
    killChainPhaseMap: Record<string, KillChainPhase>
  } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({
    attackPatternMap: helper.getAttackPatternsMap(),
    killChainPhaseMap: helper.getKillChainPhasesMap(),
  }));
  if (!ttpAlreadyLoaded) {
    useDataLoader(() => {
      dispatch(fetchKillChainPhases());
      dispatch(fetchAttackPatterns());
    });
  }
  // Attack Pattern
  const resultAttackPatternIds = R.uniq(
    injectResults
      .filter((injectResult) => !!injectResult.inject_attack_pattern)
      .flatMap((injectResult) => injectResult.inject_attack_pattern) as unknown as string[],
  );
  const resultAttackPatterns: AttackPatternStore[] = resultAttackPatternIds.map((attackPatternId: string) => attackPatternMap[attackPatternId])
    .filter((attackPattern: AttackPattern) => !!attackPattern);
  const getAttackPatterns = (killChainPhase: KillChainPhase) => {
    return resultAttackPatterns.filter((attackPattern: AttackPatternStore) => attackPattern.attack_pattern_kill_chain_phases?.includes(killChainPhase.phase_id));
  };
  // Kill Chain Phase
  const resultKillChainPhases = R.uniq(resultAttackPatterns
    .flatMap((attackPattern) => (attackPattern.attack_pattern_kill_chain_phases ?? []))
    .map((killChainPhaseId: string) => killChainPhaseMap[killChainPhaseId])
    .filter((killChainPhase) => !!killChainPhase));
  const sortKillChainPhase = (k1: KillChainPhase, k2: KillChainPhase) => {
    return (k1.phase_order ?? 0) - (k2.phase_order ?? 0);
  };
  return (
    <div className={classes.container}>
      {[...resultKillChainPhases].sort(sortKillChainPhase)
        .map((killChainPhase: KillChainPhase) => (
          <KillChainPhaseColumn
            key={killChainPhase.phase_id}
            goToLink={goToLink}
            killChainPhase={killChainPhase}
            attackPatterns={getAttackPatterns(killChainPhase)}
            injectResults={injectResults}
          />
        ))}
    </div>
  );
};

export default MitreMatrix;
