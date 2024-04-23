import { Grid, Typography } from '@mui/material';
import React, { FunctionComponent } from 'react';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { useFormatter } from '../../../../../components/i18n';

interface Props {
  scenario: ScenarioStore;
}

const ScenarioInformation: FunctionComponent<Props> = ({
  scenario,
}) => {
  // Standard hooks
  const { fldt, t } = useFormatter();

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <Typography variant="h3">{t('Subtitle')}</Typography>
        {scenario.scenario_subtitle || '-'}
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">{t('Description')}</Typography>
        {scenario.scenario_description || '-'}
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">{t('Creation date')}</Typography>
        {fldt(scenario.scenario_created_at)}
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">
          {t('Sender email address')}
        </Typography>
        {scenario.scenario_mail_from}
      </Grid>
    </Grid>
  );
};

export default ScenarioInformation;
