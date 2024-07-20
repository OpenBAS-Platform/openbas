import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import type { ScenarioInput, ScenarioInformationInput } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import { deleteScenario, duplicateScenario, exportScenarioUri, updateScenario, updateScenarioInformation } from '../../../../actions/scenarios/scenario-actions';
import ButtonPopover, { VariantButtonPopover } from '../../../../components/common/ButtonPopover';
import Drawer from '../../../../components/common/Drawer';
import ScenarioForm from '../ScenarioForm';
import DialogDelete from '../../../../components/common/DialogDelete';
import ScenarioExportDialog from './ScenarioExportDialog';
import useScenarioPermissions from '../../../../utils/Scenario';
import EmailParametersForm, { SettingUpdateInput } from '../../common/simulate/EmailParametersForm';
import DialogDuplicate from '../../../../components/common/DialogDuplicate';

export type ScenarioActionPopover = 'Update' | 'Delete' | 'Duplicate' | 'Export';

interface Props {
  scenario: ScenarioStore;
  actions: ScenarioActionPopover[];
  variantButtonPopover?: VariantButtonPopover;
  onOperationSuccess?: () => void;
}

const ScenarioPopover: FunctionComponent<Props> = ({
  scenario,
  actions = [],
  variantButtonPopover,
  onOperationSuccess,
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

  // Edition
  const [edition, setEdition] = useState(false);
  const handleOpenEdit = () => setEdition(true);
  const handleCloseEdit = () => setEdition(false);
  const submitEdit = (data: ScenarioInput) => {
    dispatch(updateScenario(scenario.scenario_id, data)).then(() => handleCloseEdit());
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
    dispatch(updateScenarioInformation(scenario.scenario_id, scenarioInformationInput)).then(() => handleCloseEdit());
  };

  // Export
  const [exportation, setExportation] = useState(false);
  const handleOpenExport = () => setExportation(true);
  const handleCloseExport = () => setExportation(false);
  const submitExport = (exportTeams: boolean, exportPlayers: boolean, exportVariableValues: boolean) => {
    const link = document.createElement('a');
    link.href = exportScenarioUri(scenario.scenario_id, exportTeams, exportPlayers, exportVariableValues);
    link.click();
    handleCloseExport();
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleOpenDelete = () => setDeletion(true);
  const handleCloseDelete = () => setDeletion(false);
  const submitDelete = () => {
    dispatch(deleteScenario(scenario.scenario_id)).then(() => {
      handleCloseDelete();
      if (onOperationSuccess) onOperationSuccess();
    });
    navigate('/admin/scenarios');
  };

  // Duplicate
  const [duplicate, setDuplicate] = useState(false);
  const handleOpenDuplicate = () => setDuplicate(true);
  const handleCloseDuplicate = () => setDuplicate(false);
  const submitDuplicate = () => {
    dispatch(duplicateScenario(scenario.scenario_id)).then((result: { result: string, entities: { scenarios: Record<string, ScenarioStore> } }) => {
      handleCloseDuplicate();
      if (onOperationSuccess) onOperationSuccess();
      navigate(`/admin/scenarios/${result.result}`);
    });
  };

  const permissions = useScenarioPermissions(scenario.scenario_id);

  const entries = [];
  if (actions.includes('Update')) entries.push({ label: 'Update', action: () => handleOpenEdit() });
  if (actions.includes('Delete')) entries.push({ label: 'Delete', action: () => handleOpenDelete() });
  if (actions.includes('Duplicate')) entries.push({ label: 'Duplicate', action: () => handleOpenDuplicate() });
  if (actions.includes('Export')) entries.push({ label: 'Export', action: () => handleOpenExport() });

  return (
    <>
      <ButtonPopover entries={entries} variant={variantButtonPopover}/>
      <Drawer
        open={edition}
        handleClose={handleCloseEdit}
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
              handleClose={handleCloseEdit}
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
        open={exportation}
        handleClose={handleCloseExport}
        handleSubmit={submitExport}
      />
      <DialogDelete
        open={deletion}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete this scenario:')} ${scenario.scenario_name} ?`}
      />
      <DialogDuplicate
        open={duplicate}
        handleClose={handleCloseDuplicate}
        handleSubmit={submitDuplicate}
        text={`${t('Do you want to duplicate this scenario:')} ${scenario.scenario_name} ?`}
      />
    </>
  );
};

export default ScenarioPopover;
