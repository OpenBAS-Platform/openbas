import React, { FunctionComponent } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { useFormatter } from '../i18n';
import { Scale } from './Tick';
import type { Theme } from '../Theme';

const useStyles = makeStyles<Theme>((theme) => ({
  scaleBar: {
    position: 'relative',
  },
  track: {
    display: 'flex',
    width: '100%',
    height: '5px',
    position: 'relative',
    backgroundColor: theme.palette.success.main!,
  },
  redTrack: {
    backgroundColor: theme.palette.error.main,
    height: '100%',
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '5px',
  },
  expectationScoreValue: {
    fontSize: 12,
    position: 'relative',
    marginLeft: '5px',
    top: '-18px',
  },
  failureLabel: {
    textAlign: 'center',
    marginTop: '5px',
    fontSize: 12,
  },
  successLabel: {
    fontSize: 12,
    textAlign: 'center',
    position: 'relative',
    top: '-14px',
  },
  label: {
    fontSize: 12,
    padding: '0 4px',
  },
}));

interface Props {
  expectationScore: number;
}

const ScaleBar: FunctionComponent<Props> = ({
  expectationScore,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const scale: Scale = {
    min: {
      value: 0,
      backgroundColor: theme.palette.error.main!,
      label: t('Failure'),
    },
    max: {
      value: 100,
      backgroundColor: 'blue',
      label: '',
    },
    ticks: [
      {
        value: expectationScore,
        backgroundColor: theme.palette.success.main!,
        label: t('Success'),
      },
    ],
  };
  const isScoreReadable = expectationScore >= 0 && expectationScore < 95;

  return (
    <div className={classes.scaleBar}>
      <div className={classes.labels}>
        <span className={classes.label}>{scale.min.value}</span>
        <span className={classes.label}>{scale.max.value}</span>
      </div>
      <div className={classes.track}>
        {isScoreReadable && (
          <>
            <div className={classes.redTrack} style={{ width: `${expectationScore}%` }}>
              <div className={classes.failureLabel}><span>{scale.min.label}</span></div>
            </div>
            <div style={{ width: `${100 - expectationScore}%` }}>
              <div className={classes.expectationScoreValue}><span>{expectationScore}</span></div>
              <div className={classes.successLabel}><span>{scale.ticks[0].label}</span></div>
            </div>
          </>
        )}
        {!isScoreReadable && (
          <>
            <div className={classes.redTrack} style={{ width: '95%' }}>
              {expectationScore < 100 && (
                <div className={classes.expectationScoreValue} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span>{expectationScore}</span>
                </div>)}
              <div className={classes.failureLabel}><span>{scale.min.label}</span></div>
            </div>
            <div style={{ width: '5%' }}>
              <div className={classes.successLabel} style={{ top: 0, marginTop: '3px' }}><span>{scale.ticks[0].label}</span></div>
            </div>
          </>)}
      </div>
    </div>
  );
};

export default ScaleBar;
