import { useParams } from 'react-router-dom';
import { Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { Groups3Outlined, MailOutlined, NotificationsOutlined, PersonOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../../../components/i18n';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import SettingsForm, { SettingUpdateInput } from '../../../components/SettingsForm';
import DefinitionMenu from '../../../components/DefinitionMenu';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import useScenarioPermissions from '../../../../../utils/Scenario';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import { fetchScenario, updateScenarioInformation } from '../../../../../actions/scenarios/scenario-actions';
import type { ScenarioInformationInput } from '../../../../../utils/api-types';
import ScenarioInformation from './ScenarioInformation';
import PaperMetric from '../../../components/PaperMetric';

const ScenarioSettings = () => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const permissions = useScenarioPermissions(scenarioId);

  // Fetching data
  const scenario = useHelper((helper: ScenariosHelper) => helper.getScenario(scenarioId));
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });

  const initialValues = {
    setting_mail_from: scenario.scenario_mail_from,
    setting_mails_reply_to: scenario.scenario_mails_reply_to,
    setting_message_header: scenario.scenario_message_header,
    setting_message_footer: scenario.scenario_message_footer,
  };

  const submitUpdate = (data: SettingUpdateInput) => {
    const scenarioInformationInput: ScenarioInformationInput = {
      scenario_mail_from: data.setting_mail_from || '',
      scenario_mails_reply_to: data.setting_mails_reply_to,
      scenario_message_header: data.setting_message_header,
      scenario_message_footer: scenario.scenario_message_footer,
    };
    dispatch(updateScenarioInformation(scenarioId, scenarioInformationInput));
  };

  return (
    <>
      <DefinitionMenu base="/admin/scenarios" id={scenario.scenario_id} />
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <PaperMetric title={t('Players')} icon={<PersonOutlined />} number={scenario.scenario_users_number ?? '-'}/>
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <PaperMetric title={t('Injects')} icon={<NotificationsOutlined />} number={scenario.scenario_injects_statistics?.total_count ?? '-'}/>
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <PaperMetric title={t('Teams')} icon={<Groups3Outlined />} number={scenario.scenario_teams.length ?? '-'}/>
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <PaperMetric title={t('Messages')} icon={<MailOutlined />} number={scenario.scenario_communications_number ?? '-'}/>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid container item xs={6} sx={{ flexDirection: 'column' }}>
          <Typography variant="h4">{t('Information')}</Typography>
          <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
            <ScenarioInformation scenario={scenario} />
          </Paper>
        </Grid>
        <Grid container item xs={6} sx={{ flexDirection: 'column' }}>
          <Typography variant="h4">{t('Settings')}</Typography>
          <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
            <SettingsForm
              initialValues={initialValues}
              onSubmit={submitUpdate}
              disabled={permissions.readOnly}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ScenarioSettings;
