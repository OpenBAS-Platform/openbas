import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import type { AttackPatternHelper } from '../../../../../../actions/attack_patterns/attackpattern-helper';
import type { KillChainPhaseHelper } from '../../../../../../actions/kill_chain_phases/killchainphase-helper';
import { useHelper } from '../../../../../../store';
import { type EsSeries, type KillChainPhase } from '../../../../../../utils/api-types';
import { sortKillChainPhase } from '../../../../../../utils/kill_chain_phases/kill_chain_phases';
import KillChainPhaseColumn from './KillChainPhaseColumn';

export const SUCCESS_100_COLOR = '#103822';
export const SUCCESS_75_COLOR = '#2f5e3d';
export const SUCCESS_50_COLOR = '#644100';
export const SUCCESS_25_COLOR = '#5C1717';

const useStyles = makeStyles()(theme => ({
  container: {
    height: '100%',
    width: '100%',
    overflow: 'auto',
    display: 'flex',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

// FIXME: sticky header
// Zoom in zoom out
// expand -> en mode ouverture de dialog ou popup à part

// Check Johanah fix back-end ->

interface Props { data: EsSeries[] }

// Show covered TTP -> remove column

const MatrixMitre: FunctionComponent<Props> = ({ data }) => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();
  // Fetching data
  // eslint-disable-next-line max-len
  const { killChainPhaseMap }: { killChainPhaseMap: Record<string, KillChainPhase> } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({ killChainPhaseMap: helper.getKillChainPhasesMap() }));

  const [showCoveredOnly, setShowCoveredOnly] = useState(false);

  const items = [
    {
      label: '100%',
      color: SUCCESS_100_COLOR,
    },
    {
      label: '< 75%',
      color: SUCCESS_75_COLOR,
    },
    {
      label: '< 50%',
      color: SUCCESS_50_COLOR,
    },
    {
      label: '< 25%',
      color: SUCCESS_25_COLOR,
    },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1),
      }}
      >
        <Box className="noDrag">
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
        <div>
          <div style={{ display: 'flex' }}>
            {items.map(({ label, color }) => (
              <Box
                key={label}
                sx={{
                  backgroundColor: color,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
                }}
              >
                <Typography variant="body2" color="white">
                  {label}
                </Typography>
              </Box>
            ))}
          </div>
        </div>
      </div>
      <Box className={classes.container}>
        {Object.values(killChainPhaseMap).toSorted(sortKillChainPhase)
          .map(phase => (
            <div key={phase.phase_id}>
              <KillChainPhaseColumn killChainPhase={phase} data={data} showCoveredOnly={showCoveredOnly} />
            </div>
          ))}
      </Box>
    </Box>
  );
};

export default MatrixMitre;
