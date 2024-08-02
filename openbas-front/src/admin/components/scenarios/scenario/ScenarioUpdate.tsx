import { Box, Tab, Tabs } from '@mui/material';
import React, { FunctionComponent, useState } from 'react';
import ScenarioForm from '../ScenarioForm';
import EmailParametersForm, { SettingUpdateInput } from '../../common/simulate/EmailParametersForm';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { ScenarioInformationInput, ScenarioInput } from '../../../../utils/api-types';
import { updateScenario, updateScenarioInformation } from '../../../../actions/scenarios/scenario-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import useScenarioPermissions from '../../../../utils/Scenario';

interface Props {
  scenario: ScenarioStore;
  open: boolean;
  handleClose: () => void;
}

const ScenarioUpdate: FunctionComponent<Props> = ({
  scenario,
  open,
  handleClose,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const permissions = useScenarioPermissions(scenario.scenario_id);

  // Tabs
  const [currentTab, setCurrentTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, value: number) => setCurrentTab(value);

  // Scenario form
  const initialValues = (({
    scenario_name,
    scenario_subtitle,
    scenario_description,
    scenario_category,
    scenario_main_focus,
    scenario_severity,
    scenario_tags,
    scenario_external_reference,
    scenario_external_url,
  }) => ({
    scenario_name,
    scenario_subtitle: scenario_subtitle ?? '',
    scenario_category: scenario_category ?? 'attack-scenario',
    scenario_main_focus: scenario_main_focus ?? 'incident-response',
    scenario_severity: scenario_severity ?? 'high',
    scenario_description: scenario_description ?? '',
    scenario_tags: scenario_tags ?? [],
    scenario_external_reference: scenario_external_reference ?? '',
    scenario_external_url: scenario_external_url ?? '',
  }))(scenario);
  const submitEdit = (data: ScenarioInput) => {
    dispatch(updateScenario(scenario.scenario_id, data));
    handleClose();
  };

  // Email parameters
  const initialValuesEmailParameters = {
    setting_mail_from: scenario.scenario_mail_from,
    setting_mails_reply_to: scenario.scenario_mails_reply_to,
    setting_message_header: scenario.scenario_message_header,
    setting_message_footer: scenario.scenario_message_footer,
  };
  const submitUpdateEmailParameters = (data: SettingUpdateInput) => {
    const scenarioInformationInput: ScenarioInformationInput = {
      scenario_mail_from: data.setting_mail_from || '',
      scenario_mails_reply_to: data.setting_mails_reply_to,
      scenario_message_header: data.setting_message_header,
      scenario_message_footer: scenario.scenario_message_footer,
    };
    dispatch(updateScenarioInformation(scenario.scenario_id, scenarioInformationInput)).then(() => handleClose());
  };

  return (
    <Drawer
      open={open}
      handleClose={handleClose}
      title={t('Update the scenario')}
    >
      <>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleChangeTab}>
            <Tab label={t('Overview')} />
            <Tab label={t('Mail configuration')} />
          </Tabs>
        </Box>
        {currentTab === 0 && (
          <ScenarioForm
            initialValues={initialValues}
            editing
            onSubmit={submitEdit}
            handleClose={handleClose}
          />
        )}
        {currentTab === 1 && (
          <EmailParametersForm
            initialValues={initialValuesEmailParameters}
            onSubmit={submitUpdateEmailParameters}
            disabled={permissions.readOnly}
          />
        )}
      </>
    </Drawer>
  );
};

export default ScenarioUpdate;
