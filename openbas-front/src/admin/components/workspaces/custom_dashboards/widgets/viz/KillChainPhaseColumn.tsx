import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import type { AttackPatternHelper } from '../../../../../../actions/attack_patterns/attackpattern-helper';
import type { KillChainPhaseHelper } from '../../../../../../actions/kill_chain_phases/killchainphase-helper';
import { useHelper } from '../../../../../../store';
import type { AttackPattern, EsSeries, KillChainPhase } from '../../../../../../utils/api-types';
import { sortAttackPattern } from '../../../../../../utils/attack_patterns/attack_patterns';
import AttackPatternBox from './AttackPatternBox';
import { resolvedData } from './MatrixMitreUtils';

const useStyles = makeStyles()(theme => ({
  column: {
    display: 'grid',
    gap: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

const KillChainPhaseColumn: FunctionComponent<{
  killChainPhase: KillChainPhase;
  data: EsSeries[];
}> = ({ killChainPhase, data }) => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();

  // Fetching data
  // eslint-disable-next-line max-len
  const { attackPatternMap }: { attackPatternMap: Record<string, AttackPattern> } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({ attackPatternMap: helper.getAttackPatternsMap() }));

  const attackPatterns: AttackPattern[] = Object.values(attackPatternMap)
    .filter((attackPattern: AttackPattern) => attackPattern.attack_pattern_kill_chain_phases?.includes(killChainPhase.phase_id))
    .filter((attackPattern: AttackPattern) => !attackPattern.attack_pattern_external_id.includes('.')); // Remove sub techniques

  const resolvedDataSuccess = resolvedData(attackPatternMap, data.at(0)?.data ?? []);
  const resolvedDataFailure = resolvedData(attackPatternMap, data.at(1)?.data ?? []);

  return (
    <>
      <Typography
        variant="h5"
        sx={{ marginBottom: theme.spacing(2) }}
      >
        {killChainPhase.phase_name}
      </Typography>
      <div className={classes.column}>
        {attackPatterns.toSorted(sortAttackPattern)
          .map(attackPattern => (
            <AttackPatternBox
              key={attackPattern.attack_pattern_id}
              attackPattern={attackPattern}
              resolvedDataSuccess={resolvedDataSuccess.filter(d => d.ttp === attackPattern.attack_pattern_external_id)}
              resolvedDataFailure={resolvedDataFailure.filter(d => d.ttp === attackPattern.attack_pattern_external_id)}
            />
          ))}
      </div>
    </>
  );
};

export default KillChainPhaseColumn;
