import { Chip } from '@mui/material';
import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import { inlineStylesColors } from '../../../../utils/Colors';

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
  scenario: ScenarioStore;
  variant?: 'list';
}

const ScenarioStatus: FunctionComponent<Props> = ({
  scenario,
  variant,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const style = variant === 'list' ? classes.chipInList : classes.chip;

  if (scenario.scenario_recurrence) {
    return (
      <Chip
        classes={{ root: style }}
        style={inlineStylesColors.blue}
        label={t('Scheduled')}
      />
    );
  }
  return (
    <Chip
      classes={{ root: style }}
      style={inlineStylesColors.grey}
      label={t('Inactive')}
    />
  );
};

export default ScenarioStatus;
