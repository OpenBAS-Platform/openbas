import React, { FunctionComponent } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { useFormatter } from '../i18n';
import { Scale } from './Tick';
import type { Theme } from '../Theme';

const useStyles = makeStyles(() => ({
  scaleBar: {
    display: 'flex',
    width: '100%',
    padding: '20px 0 20px 0',
  },
  tickContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  railSpan: {
    height: '5px',
    width: '100%',
    display: 'block',
  },
  tickLabel: {
    textAlign: 'center',
    fontSize: 12,
    padding: '10px 4px',
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
  return (
    <div className={classes.scaleBar}>
      {[scale.min, ...scale.ticks].map((tick, index) => (
        <div key={index} className={classes.tickContainer}>
          <div>
            <span>
              {tick.value}
            </span>
            {index === scale.ticks.length && (
              <span style={{ float: 'right' }}>{scale.max.value}</span>
            )}
          </div>
          <div>
            <span
              className={classes.railSpan}
              style={{ backgroundColor: tick.backgroundColor }}
            >
            </span>
          </div>
          <div className={classes.tickLabel}>
            <span>{tick.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScaleBar;
