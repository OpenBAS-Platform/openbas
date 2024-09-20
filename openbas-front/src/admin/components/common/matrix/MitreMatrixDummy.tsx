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
import KillChainPhaseColumn from './KillChainPhaseColumn';
import { random } from '../../../../utils/Number';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
    display: 'flex',
    gap: 20,
    overflowX: 'auto',
    // test
    animation: 'detect-scroll linear',
    animationTimeline: 'scroll(self inline)',
  },
}));

interface Props {
  ttpAlreadyLoaded?: boolean;
}

const MitreMatrixDummy: FunctionComponent<Props> = ({ ttpAlreadyLoaded }) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Fetching data
  const { attackPatterns, killChainPhaseMap }: {
    attackPatterns: AttackPattern[],
    killChainPhaseMap: Record<string, KillChainPhase>
  } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({
    attackPatterns: helper.getAttackPatterns(),
    killChainPhaseMap: helper.getKillChainPhasesMap(),
  }));

  if (!ttpAlreadyLoaded) {
    useDataLoader(() => {
      dispatch(fetchKillChainPhases());
      dispatch(fetchAttackPatterns());
    });
  }
  // Attack Pattern

  // Kill Chain Phase
  const sortKillChainPhase = (k1: KillChainPhase, k2: KillChainPhase) => {
    return (k1.phase_order ?? 0) - (k2.phase_order ?? 0);
  };
  const getAttackPatterns = (killChainPhase: KillChainPhase) => {
    return R.take(random(3, 6), attackPatterns.filter((attackPattern: AttackPatternStore) => attackPattern.attack_pattern_kill_chain_phases?.includes(killChainPhase.phase_id)));
  };
  return (
    <div className={classes.container}>
      {R.values(killChainPhaseMap).sort(sortKillChainPhase)
        .map((killChainPhase: KillChainPhase) => (
          <KillChainPhaseColumn
            key={killChainPhase.phase_id}
            killChainPhase={killChainPhase}
            attackPatterns={getAttackPatterns(killChainPhase)}
            injectResults={[]}
            dummy={true}
          />
        ))}
    </div>
  );
};

export default MitreMatrixDummy;
