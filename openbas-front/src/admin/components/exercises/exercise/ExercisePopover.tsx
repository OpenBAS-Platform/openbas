import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useFormatter } from '../../../../components/i18n';
import { deleteExercise, updateExercise } from '../../../../actions/Exercise';
import { usePermissions } from '../../../../utils/Exercise';
import Transition from '../../../../components/common/Transition';
import type { Exercise, ExerciseUpdateInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import ExerciseUpdateForm from '../ExerciseUpdateForm';
import Drawer from '../../../../components/common/Drawer';

interface ExercisePopoverProps {
  exercise: Exercise;
}

const ExercisePopover: FunctionComponent<ExercisePopoverProps> = ({
  exercise,
}) => {
  const { t } = useFormatter();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [exportPlayers, setExportPlayers] = useState(false);
  const [exportVariableValues, setExportVariableValues] = useState(false);

  // Edition
  const handleOpenEdit = () => {
    setOpenEdit(true);
  };

  const handleCloseEdit = () => setOpenEdit(false);

  const onSubmitEdit = (data: ExerciseUpdateInput) => {
    const input = {
      exercise_name: data.exercise_name,
      exercise_subtitle: data.exercise_subtitle,
      exercise_description: data.exercise_description,
      exercise_mail_from: exercise.exercise_mail_from,
      exercise_message_header: exercise.exercise_message_header,
      exercise_message_footer: exercise.exercise_message_footer,
    };
    return dispatch(updateExercise(exercise.exercise_id, input)).then(() => handleCloseEdit());
  };

  // Deletion
  const handleOpenDelete = () => {
    setOpenDelete(true);
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const submitDelete = () => {
    dispatch(deleteExercise(exercise.exercise_id)).then(() => handleCloseDelete());
    navigate('/admin/exercises');
  };

  // Export
  const handleOpenExport = () => {
    setOpenExport(true);
  };

  const handleCloseExport = () => setOpenExport(false);

  const submitExport = () => {
    const link = document.createElement('a');
    link.href = `/api/exercises/${exercise.exercise_id}/export?isWithPlayers=${exportPlayers}&isWithVariableValues=${exportVariableValues}`;
    link.click();
    handleCloseExport();
  };

  const handleToggleExportPlayers = () => setExportPlayers(!exportPlayers);
  const handleToggleExportVariableValues = () => setExportVariableValues(!exportVariableValues);

  // Form

  const initialValues: ExerciseUpdateInput = {
    exercise_name: exercise.exercise_name,
    exercise_subtitle: exercise.exercise_subtitle,
    exercise_description: exercise.exercise_description,
  };

  const permissions = usePermissions(exercise.exercise_id);

  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: handleOpenEdit, disabled: !permissions.canWriteBypassStatus },
    { label: 'Export', action: handleOpenExport },
    { label: 'Delete', action: handleOpenDelete, disabled: !permissions.canWriteBypassStatus },
  ];

  return (
    <>
      <ButtonPopover entries={entries} />
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this simulation?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Drawer
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the simulation')}
      >
        <ExerciseUpdateForm
          initialValues={initialValues}
          onSubmit={onSubmitEdit}
          handleClose={handleCloseEdit}
        />
      </Drawer>
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
                    <Checkbox checked={true} disabled={true} />
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
