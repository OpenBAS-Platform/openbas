import { Chip, Tooltip } from '@mui/material';
import { FunctionComponent, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useHelper } from '../../../store';
import type { AttackPatternHelper } from '../../../actions/attack_patterns/attackpattern-helper';
import { AttackPattern } from '../../../utils/api-types';

const useStyles = makeStyles()(theme => ({
  chip: {
    fontSize: 12,
    height: 25,
    marginRight: theme.spacing(1),
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 180,
  },
}));

interface Props {attackPatternId: string;}

const AttackPatternChip: FunctionComponent<Props> = ({ attackPatternId }) => {
  const { classes } = useStyles();
  const { attackPatterns } = useHelper((helper: AttackPatternHelper) => ({ attackPatterns: helper.getAttackPatternsMap() }));
  const [attackPattern, setAttackPattern] = useState<AttackPattern>();

  useEffect(() => {
    setAttackPattern(attackPatterns[attackPatternId]);
  }, [attackPatterns]);

  if (!attackPattern) {
    return (<></>);
  }

  return (
    <Tooltip title={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}>
      <Chip
        variant="outlined"
        classes={{ root: classes.chip }}
        color="primary"
        label={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}
      />
    </Tooltip>
  );
};

export default AttackPatternChip;
