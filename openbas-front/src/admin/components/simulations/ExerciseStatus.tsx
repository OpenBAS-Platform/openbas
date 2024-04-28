import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { Chip } from '@mui/material';
import { useFormatter } from '../../../components/i18n';
import type { ExerciseStore } from '../../../actions/exercises/Exercise';
import { inlineStylesColors } from '../../../utils/Colors';

const useStyles = makeStyles(() => ({
  chip: {
    fontSize: 14,
    fontWeight: 800,
    textTransform: 'uppercase',
    borderRadius: '0',
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 120,
  },
}));

interface Props {
  exerciseStatus: ExerciseStore['exercise_status'];
  variant?: 'list';
}

const ExerciseStatus: FunctionComponent<Props> = ({
  exerciseStatus,
  variant,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const style = variant === 'list' ? classes.chipInList : classes.chip;

  switch (exerciseStatus) {
    case 'SCHEDULED':
      return (
        <Chip
          classes={{ root: style }}
          style={inlineStylesColors.blue}
          label={t('Scheduled')}
        />
      );
    case 'RUNNING':
      return (
        <Chip
          classes={{ root: style }}
          style={inlineStylesColors.green}
          label={t('Running')}
        />
      );
    case 'PAUSED':
      return (
        <Chip
          classes={{ root: style }}
          style={inlineStylesColors.orange}
          label={t('Paused')}
        />
      );
    case 'CANCELED':
      return (
        <Chip
          classes={{ root: style }}
          style={inlineStylesColors.white}
          label={t('Canceled')}
        />
      );
    case 'FINISHED':
      return (
        <Chip
          classes={{ root: style }}
          style={inlineStylesColors.grey}
          label={t('Finished')}
        />
      );
    default:
      return (
        <Chip
          classes={{ root: style }}
          style={inlineStylesColors.blue}
          label={t('Scheduled')}
        />
      );
  }
};
export default ExerciseStatus;
