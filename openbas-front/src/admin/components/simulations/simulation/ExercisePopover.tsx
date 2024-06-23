import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import { deleteExercise, updateExercise } from '../../../../actions/Exercise';
import { usePermissions } from '../../../../utils/Exercise';
import Transition from '../../../../components/common/Transition';
import type { Exercise, ExerciseUpdateInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import ExerciseUpdateForm from './ExerciseUpdateForm';
import Drawer from '../../../../components/common/Drawer';
import EmailParametersForm, { SettingUpdateInput } from '../../common/simulate/EmailParametersForm';
import { isNotEmptyField } from '../../../../utils/utils';

interface ExercisePopoverProps {
  exercise: Exercise;
  entries: ButtonPopoverEntry[];
  openEdit?: boolean;
  openDelete?: boolean;
  openExport?: boolean;
  setOpenEdit?: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenDelete?: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenExport?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExercisePopover: FunctionComponent<ExercisePopoverProps> = ({
  exercise,
  entries,
  openEdit,
  openDelete,
  openExport,
  setOpenEdit,
  setOpenDelete,
  setOpenExport,
}) => {
  const { t } = useFormatter();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [deletion, setDeletion] = useState(false);
  const [edition, setEdition] = useState(false);
  const [exportation, setExportation] = useState(false);
  const [exportTeams, setExportTeams] = useState(false);
  const [exportPlayers, setExportPlayers] = useState(false);
  const [exportVariableValues, setExportVariableValues] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const handleChangeTab = (event: React.SyntheticEvent, value: number) => setCurrentTab(value);

  const handleCloseEdit = () => setEdition(false);

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

  const handleCloseDelete = () => setDeletion(false);

  const submitDelete = () => {
    dispatch(deleteExercise(exercise.exercise_id)).then(() => handleCloseDelete());
    navigate('/admin/exercises');
  };

  const handleCloseExport = () => setExportation(false);

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
    exercise_subtitle: exercise.exercise_subtitle,
    exercise_description: exercise.exercise_description,
    exercise_category: exercise.exercise_category ?? 'attack-scenario',
    exercise_main_focus: exercise.exercise_main_focus ?? 'incident-response',
    exercise_severity: exercise.exercise_severity ?? 'high',
  };
  const initialValuesEmailParameters = {
    setting_mail_from: exercise.exercise_mail_from,
    setting_mails_reply_to: exercise.exercise_mails_reply_to,
    setting_message_header: exercise.exercise_message_header,
    setting_message_footer: exercise.exercise_message_footer,
  };
  const permissions = usePermissions(exercise.exercise_id);

  return (
    <>
      <ButtonPopover entries={entries} />
      <Dialog
        open={isNotEmptyField(openDelete) ? openDelete : deletion}
        TransitionComponent={Transition}
        onClose={() => (setOpenDelete ? setOpenDelete(false) : handleCloseDelete)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this simulation?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => (setOpenDelete ? setOpenDelete(false) : handleCloseDelete)}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Drawer
        open={isNotEmptyField(openEdit) ? openEdit : edition}
        handleClose={() => (setOpenEdit ? setOpenEdit(false) : handleCloseEdit)}
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
      <Dialog
        open={isNotEmptyField(openExport) ? openExport : exportation}
        TransitionComponent={Transition}
        onClose={() => (setOpenExport ? setOpenExport(false) : handleCloseExport)}
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
          <Button onClick={() => (setOpenExport ? setOpenExport(false) : handleCloseExport)}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitExport}>
            {t('Export')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExercisePopover;
