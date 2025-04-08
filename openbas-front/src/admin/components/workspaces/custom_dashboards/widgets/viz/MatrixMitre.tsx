import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';
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
    overflowX: 'auto',
    overflowY: 'auto',
    paddingRight: theme.spacing(1),
  },
  content: {
    display: 'flex',
    gap: theme.spacing(2),
  },
}));

interface Props { data: EsSeries[] }

const MatrixMitre: FunctionComponent<Props> = ({ data }) => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();
  // Fetching data
  // eslint-disable-next-line max-len
  const { killChainPhaseMap }: { killChainPhaseMap: Record<string, KillChainPhase> } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({ killChainPhaseMap: helper.getKillChainPhasesMap() }));

  const [showCoveredOnly, setShowCoveredOnly] = useState(false);

  return (
    <div className={classes.container}>
      <Box className="noDrag" sx={{ marginBottom: theme.spacing(1) }}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={showCoveredOnly}
              onChange={e => setShowCoveredOnly(e.target.checked)}
              color="primary"
            />
          )}
          label="Show covered TTP only"
        />
      </Box>
      <div className={classes.content}>
        {Object.values(killChainPhaseMap).toSorted(sortKillChainPhase)
          .map(phase => (
            <div key={phase.phase_id}>
              <KillChainPhaseColumn killChainPhase={phase} data={data} showCoveredOnly={showCoveredOnly} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default MatrixMitre;
