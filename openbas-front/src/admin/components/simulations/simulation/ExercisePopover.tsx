import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
} from '@mui/material';
import { useFormatter } from '../../../../components/i18n';
import { deleteExercise, duplicateExercise, updateExercise } from '../../../../actions/Exercise';
import { usePermissions } from '../../../../utils/Exercise';
import Transition from '../../../../components/common/Transition';
import type { ExerciseUpdateInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover from '../../../../components/common/ButtonPopover';
import ExerciseUpdateForm from './ExerciseUpdateForm';
import Drawer from '../../../../components/common/Drawer';
import EmailParametersForm, { SettingUpdateInput } from '../../common/simulate/EmailParametersForm';
import DialogDuplicate from '../../../../components/common/DialogDuplicate';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import DialogDelete from '../../../../components/common/DialogDelete';
import { useHelper } from '../../../../store';
import type { TagHelper, UserHelper } from '../../../../actions/helper';
import ExerciseReports from './reports/ExerciseReports';

export type ExerciseActionPopover = 'Duplicate' | 'Update' | 'Delete' | 'Export' | 'Access reports';

interface ExercisePopoverProps {
  exercise: ExerciseStore;
  actions: ExerciseActionPopover[];
  onDelete?: (result: string) => void;
  inList?: boolean;
}

const ExercisePopover: FunctionComponent<ExercisePopoverProps> = ({
  exercise,
  actions = [],
  onDelete,
  inList = false,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Edit
  const [openEdit, setOpenEdit] = useState(false);
  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);

  const onSubmitEdit = (data: ExerciseUpdateInput) => {
    const input = {
      exercise_name: data.exercise_name,
      exercise_subtitle: data.exercise_subtitle,
      exercise_severity: data.exercise_severity,
      exercise_category: data.exercise_category,
      exercise_description: data.exercise_description,
      exercise_main_focus: data.exercise_main_focus,
      exercise_tags: data.exercise_tags,
      exercise_mails_reply_to: exercise.exercise_mails_reply_to,
      exercise_mail_from: exercise.exercise_mail_from,
      exercise_message_header: exercise.exercise_message_header,
      exercise_message_footer: exercise.exercise_message_footer,
    };
    return dispatch(updateExercise(exercise.exercise_id, input)).then(() => handleCloseEdit());
  };
  const submitUpdateEmailParameters = (data: SettingUpdateInput) => {
    const exerciseInformationInput: ExerciseUpdateInput = {
      exercise_name: exercise.exercise_name,
      exercise_subtitle: exercise.exercise_subtitle,
      exercise_severity: exercise.exercise_severity,
      exercise_category: exercise.exercise_category,
      exercise_description: exercise.exercise_description,
      exercise_main_focus: exercise.exercise_main_focus,
      exercise_mail_from: data.setting_mail_from || '',
      exercise_mails_reply_to: data.setting_mails_reply_to,
      exercise_message_header: data.setting_message_header,
      exercise_message_footer: exercise.exercise_message_footer,
    };
    dispatch(updateExercise(exercise.exercise_id, exerciseInformationInput)).then(() => handleCloseEdit());
  };

  // Delete
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  const submitDelete = () => {
    dispatch(deleteExercise(exercise.exercise_id)).then(() => {
      handleCloseDelete();
      if (onDelete) onDelete(exercise.exercise_id);
    });
  };

  // Duplicate
  const [openDuplicate, setOpenDuplicate] = useState(false);
  const handleOpenDuplicate = () => setOpenDuplicate(true);
  const handleCloseDuplicate = () => setOpenDuplicate(false);

  const submitDuplicate = () => {
    dispatch(duplicateExercise(exercise.exercise_id)).then((result: { result: string, entities: { exercises: ExerciseStore } }) => {
      handleCloseDuplicate();
      navigate(`/admin/exercises/${result.result}`);
    });
  };

  // Export
  const [openExport, setOpenExport] = useState(false);
  const [exportTeams, setExportTeams] = useState(false);
  const [exportPlayers, setExportPlayers] = useState(false);
  const [exportVariableValues, setExportVariableValues] = useState(false);
  const handleOpenExport = () => setOpenExport(true);
  const handleCloseExport = () => setOpenExport(false);

  // Reports
  const [openReports, setOpenReports] = useState(false);
  const handleOpenReports = () => setOpenReports(true);
  const handleCloseReports = () => setOpenReports(false);

  // Tab
  const [currentTab, setCurrentTab] = useState(0);

  const handleChangeTab = (_: React.SyntheticEvent, value: number) => setCurrentTab(value);

  const submitExport = () => {
    const link = document.createElement('a');
    link.href = `/api/exercises/${exercise.exercise_id}/export?isWithTeams=${exportTeams}&isWithPlayers=${exportPlayers}&isWithVariableValues=${exportVariableValues}`;
    link.click();
    handleCloseExport();
  };

  const handleToggleExportTeams = () => setExportTeams(!exportTeams);
  const handleToggleExportPlayers = () => setExportPlayers(!exportPlayers);
  const handleToggleExportVariableValues = () => setExportVariableValues(!exportVariableValues);

  // Form
  const initialValues: ExerciseUpdateInput = {
    exercise_name: exercise.exercise_name,
    exercise_subtitle: exercise.exercise_subtitle ?? '',
    exercise_description: exercise.exercise_description,
    exercise_category: exercise.exercise_category ?? 'attack-scenario',
    exercise_main_focus: exercise.exercise_main_focus ?? 'incident-response',
    exercise_severity: exercise.exercise_severity ?? 'high',
    exercise_tags: exercise.exercise_tags ?? [],
  };
  const initialValuesEmailParameters = {
    setting_mail_from: exercise.exercise_mail_from,
    setting_mails_reply_to: exercise.exercise_mails_reply_to,
    setting_message_header: exercise.exercise_message_header,
    setting_message_footer: exercise.exercise_message_footer,
  };
  const permissions = usePermissions(exercise.exercise_id);

  // Fetching data
  const { userAdmin } = useHelper((helper: TagHelper & UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  // Button Popover
  const entries = [];
  if (actions.includes('Duplicate')) entries.push({ label: 'Duplicate', action: () => handleOpenDuplicate() });
  if (actions.includes('Update')) entries.push({ label: 'Update', action: () => handleOpenEdit(), disabled: !permissions.canWriteBypassStatus });
  if (actions.includes('Delete')) entries.push({ label: 'Delete', action: () => handleOpenDelete(), disabled: !userAdmin });
  if (actions.includes('Export')) entries.push({ label: 'Export', action: () => handleOpenExport() });
  if (actions.includes('Access reports')) entries.push({ label: 'Access reports', action: () => handleOpenReports() });

  return (
    <>
      <ButtonPopover entries={entries} variant={inList ? 'icon' : 'toggle'} />
      <Drawer
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the simulation')}
      >
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleChangeTab}>
              <Tab label={t('Overview')} />
              <Tab label={t('Mail configuration')} />
            </Tabs>
          </Box>
          {currentTab === 0 && (
            <ExerciseUpdateForm
              initialValues={initialValues}
              onSubmit={onSubmitEdit}
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
      <Drawer
        open={openReports}
        containerStyle={{ padding: '0px' }}
        handleClose={handleCloseReports}
        title={t('Reports')}
      >
        <ExerciseReports exerciseId={exercise.exercise_id} exerciseName={exercise.exercise_name} />
      </Drawer>
      <DialogDelete
        open={openDelete}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete this simulation:')} ${exercise.exercise_name} ?`}
      />
      <DialogDuplicate
        open={openDuplicate}
        handleClose={handleCloseDuplicate}
        handleSubmit={submitDuplicate}
        text={`${t('Do you want to duplicate this simulation:')} ${exercise.exercise_name} ?`}
      />
      <Dialog
        open={openExport}
        TransitionComponent={Transition}
        onClose={handleCloseExport}
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Export the simulation')}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table aria-label="export table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Elements')}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    {t('Export')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {t('Injects (including attached files)')}
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <Checkbox checked={true} disabled={true} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Teams')}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={exportTeams}
                      onChange={handleToggleExportTeams}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Players')}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={exportPlayers}
                      onChange={handleToggleExportPlayers}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Variable values')}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={exportVariableValues}
                      onChange={handleToggleExportVariableValues}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExport}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitExport}>
            {t('Export')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExercisePopover;
