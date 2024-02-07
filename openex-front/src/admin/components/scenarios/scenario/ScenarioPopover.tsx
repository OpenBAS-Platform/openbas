import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScenarioInput } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import { deleteScenario, exportScenarioUri, updateScenario } from '../../../../actions/scenarios/scenario-actions';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import Drawer from '../../../../components/common/Drawer';
import ScenarioForm from '../ScenarioForm';
import DialogDelete from '../../../../components/common/DialogDelete';
import ScenarioExportDialog from './ScenarioExportDialog';

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

  const initialValues = (({
    scenario_name,
    scenario_subtitle,
    scenario_description,
    scenario_tags,
  }) => ({
    scenario_name,
    scenario_subtitle: scenario_subtitle ?? '',
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

  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: handleEdit },
    { label: 'Export', action: handleExport },
    { label: 'Delete', action: handleDelete },
  ];

  return (
    <>
      <ButtonPopover entries={entries} />
      <Drawer
        open={edition}
        handleClose={() => setEdition(false)}
        title={t('Update the scenario')}
      >
        <ScenarioForm
          initialValues={initialValues}
          editing={true}
          onSubmit={submitEdit}
          handleClose={() => setEdition(false)}
        />
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
