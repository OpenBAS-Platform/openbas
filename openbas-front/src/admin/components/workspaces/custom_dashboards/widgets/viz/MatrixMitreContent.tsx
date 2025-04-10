import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import type { AttackPatternHelper } from '../../../../../../actions/attack_patterns/attackpattern-helper';
import type { KillChainPhaseHelper } from '../../../../../../actions/kill_chain_phases/killchainphase-helper';
import { useHelper } from '../../../../../../store';
import { type AttackPattern, type EsSeries, type KillChainPhase } from '../../../../../../utils/api-types';
import { sortKillChainPhase } from '../../../../../../utils/kill_chain_phases/kill_chain_phases';
import KillChainPhaseColumn from './KillChainPhaseColumn';
import { filterByKillChainPhase, resolvedData, SUCCESS_25_COLOR, SUCCESS_50_COLOR, SUCCESS_75_COLOR, SUCCESS_100_COLOR } from './MatrixMitreUtils';

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

const useStyles = makeStyles()(theme => ({
  container: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

interface Props { data: EsSeries[] }

const MatrixMitreContent: FunctionComponent<Props> = ({ data }) => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();
  // Fetching data
  // eslint-disable-next-line max-len
  const { attackPatternMap, killChainPhaseMap }: {
    attackPatternMap: Record<string, AttackPattern>;
    killChainPhaseMap: Record<string, KillChainPhase>;
  } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({
    attackPatternMap: helper.getAttackPatternsMap(),
    killChainPhaseMap: helper.getKillChainPhasesMap(),
  }));

  const resolvedDataSuccess = resolvedData(attackPatternMap, killChainPhaseMap, data.at(0)?.data ?? []);
  const resolvedDataFailure = resolvedData(attackPatternMap, killChainPhaseMap, data.at(1)?.data ?? []);

  const [showCoveredOnly, setShowCoveredOnly] = useState(false);
  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      minHeight={0}
    >
      <div style={{
        position: 'sticky',
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
          .map((phase) => {
            const resolvedDataSuccessByKillChainPhase = filterByKillChainPhase(resolvedDataSuccess, phase.phase_external_id);
            const resolvedDataFailureByKillChainPhase = filterByKillChainPhase(resolvedDataFailure, phase.phase_external_id);
            return (
              <KillChainPhaseColumn
                key={phase.phase_id}
                killChainPhase={phase}
                showCoveredOnly={showCoveredOnly}
                resolvedDataSuccess={resolvedDataSuccessByKillChainPhase}
                resolvedDataFailure={resolvedDataFailureByKillChainPhase}
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default MatrixMitreContent;
