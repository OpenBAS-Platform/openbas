import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import type { ScenarioInput, ScenarioInformationInput } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import { deleteScenario, exportScenarioUri, updateScenario, updateScenarioInformation, duplicateScenario } from '../../../../actions/scenarios/scenario-actions';
import ButtonPopover, { PopoverEntry, VariantButtonPopover } from '../../../../components/common/ButtonPopover';
import Drawer from '../../../../components/common/Drawer';
import ScenarioForm from '../ScenarioForm';
import DialogDelete from '../../../../components/common/DialogDelete';
import ScenarioExportDialog from './ScenarioExportDialog';
import useScenarioPermissions from '../../../../utils/Scenario';
import EmailParametersForm, { SettingUpdateInput } from '../../common/simulate/EmailParametersForm';
import { isNotEmptyField } from '../../../../utils/utils';
import DialogDuplicate from '../../../../components/common/DialogDuplicate';

interface Props {
  scenario: ScenarioStore;
  entries: PopoverEntry[];
  openEdit?: boolean;
  setOpenEdit?: React.Dispatch<React.SetStateAction<boolean>>;
  openExport?: boolean;
  setOpenExport?: React.Dispatch<React.SetStateAction<boolean>>;
  openDelete?: boolean;
  setOpenDelete?: React.Dispatch<React.SetStateAction<boolean>>;
  openDuplicate?: boolean;
  setOpenDuplicate?: React.Dispatch<React.SetStateAction<boolean>>;
  variantButtonPopover?: VariantButtonPopover;
}

const ScenarioPopover: FunctionComponent<Props> = ({
  scenario,
  entries,
  openEdit,
  setOpenEdit,
  openExport,
  setOpenExport,
  openDelete,
  setOpenDelete,
  openDuplicate,
  setOpenDuplicate,
  variantButtonPopover,
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
  const handleCloseEdit = () => setEdition(false);
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
    dispatch(updateScenarioInformation(scenario.scenario_id, scenarioInformationInput)).then(() => setEdition(false));
  };

  // Export
  const [exportation, setExportation] = useState(false);
  const handleCloseExport = () => setExportation(false);
  const submitExport = (exportTeams: boolean, exportPlayers: boolean, exportVariableValues: boolean) => {
    const link = document.createElement('a');
    link.href = exportScenarioUri(scenario.scenario_id, exportTeams, exportPlayers, exportVariableValues);
    link.click();
    if (setOpenExport) {
      setOpenExport(false);
    }
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleCloseDelete = () => {
    setDeletion(false);
  };
  const submitDelete = () => {
    dispatch(deleteScenario(scenario.scenario_id));
    if (setOpenDelete) {
      setOpenDelete(false);
    }
    navigate('/admin/scenarios');
  };

  // Duplicate
  const [duplicate, setDuplicate] = useState(false);
  const handleCloseDuplicate = () => {
    setDuplicate(false);
  };
  const submitDuplicate = () => {
    dispatch(duplicateScenario(scenario.scenario_id)).then((result: { result: string, entities: { scenarios: Record<string, ScenarioStore> } }) => {
      navigate(`/admin/scenarios/${result.result}`);
      if (setOpenDuplicate) {
        setOpenDuplicate(false);
      }
    });
  };

  const submitDuplicateHandler = () => {
    submitDuplicate();
  };

  const permissions = useScenarioPermissions(scenario.scenario_id);

  return (
    <>
      <ButtonPopover entries={entries} variant={variantButtonPopover}/>
      <Drawer
        open={isNotEmptyField(openEdit) ? openEdit : edition}
        handleClose={() => (setOpenEdit ? setOpenEdit(false) : handleCloseEdit)}
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
              handleClose={() => (setOpenEdit ? setOpenEdit(false) : handleCloseEdit)}
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
        open={isNotEmptyField(openExport) ? openExport : exportation}
        handleClose={() => (setOpenExport ? setOpenExport(false) : handleCloseExport)}
        handleSubmit={submitExport}
      />
      <DialogDelete
        open={isNotEmptyField(openDelete) ? openDelete : deletion}
        handleClose={() => (setOpenDelete ? setOpenDelete(false) : handleCloseDelete)}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete this scenario:')} ${scenario.scenario_name} ?`}
      />
      <DialogDuplicate
        open={isNotEmptyField(openDuplicate) ? openDuplicate : duplicate}
        handleClose={() => (setOpenDuplicate ? setOpenDuplicate(false) : handleCloseDuplicate)}
        handleSubmit={submitDuplicateHandler}
        text={`${t('Do you want to duplicate this scenario:')} ${scenario.scenario_name} ?`}
      />
    </>
  );
};

export default ScenarioPopover;
