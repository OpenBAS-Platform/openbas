import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import type { AttackPatternHelper } from '../../../../../../actions/attack_patterns/attackpattern-helper';
import type { KillChainPhaseHelper } from '../../../../../../actions/kill_chain_phases/killchainphase-helper';
import { useHelper } from '../../../../../../store';
import { type EsSeries, type KillChainPhase } from '../../../../../../utils/api-types';
import { sortKillChainPhase } from '../../../../../../utils/kill_chain_phases/kill_chain_phases';
import KillChainPhaseColumn from './KillChainPhaseColumn';

const useStyles = makeStyles()(theme => ({
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    gap: theme.spacing(2),
    overflowX: 'auto',
    overflowY: 'auto',
    paddingRight: theme.spacing(1),
  },
}));

interface Props { data: EsSeries[] }

const MatrixMitre: FunctionComponent<Props> = ({ data }) => {
  // Standard hooks
  const { classes } = useStyles();
  // Fetching data
  // eslint-disable-next-line max-len
  const { killChainPhaseMap }: { killChainPhaseMap: Record<string, KillChainPhase> } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({ killChainPhaseMap: helper.getKillChainPhasesMap() }));

  return (
    <div className={classes.container}>
      {Object.values(killChainPhaseMap).toSorted(sortKillChainPhase)
        .map(phase => (
          <div key={phase.phase_id}>
            <KillChainPhaseColumn killChainPhase={phase} data={data} />
          </div>
        ))}
    </div>
  );
};

export default MatrixMitre;
