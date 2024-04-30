import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import type { ScenarioInput, ScenarioInformationInput } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import { deleteScenario, exportScenarioUri, updateScenario, updateScenarioInformation } from '../../../../actions/scenarios/scenario-actions';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import Drawer from '../../../../components/common/Drawer';
import ScenarioForm from '../ScenarioForm';
import DialogDelete from '../../../../components/common/DialogDelete';
import ScenarioExportDialog from './ScenarioExportDialog';
import useScenarioPermissions from '../../../../utils/Scenario';
import EmailParametersForm, { SettingUpdateInput } from '../../common/simulate/EmailParametersForm';

interface Props {
  scenario: ScenarioStore;
}

const ScenarioPopover: FunctionComponent<Props> = ({
  scenario,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, value: number) => setCurrentTab(value);

  const initialValues = (({
    scenario_name,
    scenario_subtitle,
    scenario_description,
    scenario_category,
    scenario_main_focus,
    scenario_severity,
    scenario_tags,
  }) => ({
    scenario_name,
    scenario_subtitle: scenario_subtitle ?? '',
    scenario_category: scenario_category ?? 'attack-scenario',
    scenario_main_focus: scenario_main_focus ?? 'incident-response',
    scenario_severity: scenario_severity ?? 'high',
    scenario_description: scenario_description ?? '',
    scenario_tags: scenario_tags ?? [],
  }))(scenario);

  // Edition
  const [edition, setEdition] = useState(false);
  const handleEdit = () => {
    setEdition(true);
  };
  const submitEdit = (data: ScenarioInput) => {
    dispatch(updateScenario(scenario.scenario_id, data));
    setEdition(false);
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
    dispatch(updateScenarioInformation(scenario.scenario_id, scenarioInformationInput));
  };

  // Export
  const [openExport, setOpenExport] = useState(false);
  const handleExport = () => {
    setOpenExport(true);
  };
  const submitExport = (exportPlayers: boolean, exportVariableValues: boolean) => {
    const link = document.createElement('a');
    link.href = exportScenarioUri(scenario.scenario_id, exportPlayers, exportVariableValues);
    link.click();
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleDelete = () => {
    setDeletion(true);
  };
  const submitDelete = () => {
    dispatch(deleteScenario(scenario.scenario_id));
    setDeletion(false);
    navigate('/admin/scenarios');
  };

  const permissions = useScenarioPermissions(scenario.scenario_id);

  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: handleEdit, disabled: !permissions.canWrite },
    { label: 'Export', action: handleExport },
    { label: 'Delete', action: handleDelete, disabled: !permissions.canWrite },
  ];

  return (
    <>
      <ButtonPopover entries={entries} />
      <Drawer
        open={edition}
        handleClose={() => setEdition(false)}
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
              handleClose={() => setEdition(false)}
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
      <ScenarioExportDialog
        open={openExport}
        handleClose={() => setOpenExport(false)}
        handleSubmit={submitExport}
      />
      <DialogDelete
        open={deletion}
        handleClose={() => setDeletion(false)}
        handleSubmit={submitDelete}
        text={t('Do you want to delete the scenario ?')}
      />
    </>
  );
};

export default ScenarioPopover;
