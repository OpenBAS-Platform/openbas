import { Button, type Theme, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import type { AttackPattern, EsSeriesData } from '../../../../../../utils/api-types';
import { SUCCESS_25_COLOR, SUCCESS_50_COLOR, SUCCESS_75_COLOR, SUCCESS_100_COLOR } from './MatrixMitre';

const useStyles = makeStyles()(theme => ({
  button: {
    textTransform: 'capitalize',
    color: theme.palette.text?.primary,
    backgroundColor: theme.palette.background.accent,
    borderRadius: theme.borderRadius,
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr',
    gap: theme.spacing(1),
    width: '100%',
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  },
}));

const getBackgroundColor = (theme: Theme, success: number, failure: number): string | undefined => {
  const total = success + failure;
  if (total === 0) return undefined;

  const ratio = success / total;

  if (ratio === 1) return SUCCESS_100_COLOR;
  if (ratio === 0) return SUCCESS_25_COLOR;
  if (ratio >= 0.75) return SUCCESS_75_COLOR;
  return SUCCESS_50_COLOR;
};
const getTextColor = (theme: Theme, success: number, failure: number): string | undefined => {
  if (success === 0 && failure === 0) return theme.typography.h3.color;
  return theme.palette.common.white;
};

const AttackPatternBox: FunctionComponent<{
  showCoveredOnly: boolean;
  attackPattern: AttackPattern;
  resolvedDataSuccess: EsSeriesData[];
  resolvedDataFailure: EsSeriesData[];
}> = ({ showCoveredOnly, attackPattern, resolvedDataSuccess, resolvedDataFailure }) => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();

  const success = resolvedDataSuccess.length;
  const failure = resolvedDataFailure.length;
  const total = success + failure;
  const backgroundColor = getBackgroundColor(theme, success, failure);
  const textColor = getTextColor(theme, success, failure);

  if (resolvedDataSuccess.length === 0 && resolvedDataFailure.length === 0 && showCoveredOnly) {
    return (<></>);
  }

  return (
    <Button
      aria-haspopup="true"
      style={{ backgroundColor }}
      className={classes.button}
    >
      <div className={classes.container}>
        <Typography sx={{
          textAlign: 'left',
          color: textColor,
          whiteSpace: 'normal',
          fontSize: theme.typography.h3.fontSize,
        }}
        >
          {attackPattern.attack_pattern_name}
        </Typography>
        <Typography sx={{
          textAlign: 'right',
          fontSize: theme.typography.h3.fontSize,
        }}
        >
          {total > 0
            && (
              <>
                {resolvedDataSuccess.length}
                /
                {total}
              </>
            )}
        </Typography>
        <Typography sx={{
          textAlign: 'left',
          color: textColor,
        }}
        >
          {attackPattern.attack_pattern_external_id}
        </Typography>
      </div>
    </Button>
  );
};

export default AttackPatternBox;

// Show covered TTP only
