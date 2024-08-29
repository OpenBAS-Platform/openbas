import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { UpdateOutlined } from '@mui/icons-material';
import { updateExerciseStartDate } from '../../../../actions/Exercise';
import { useFormatter } from '../../../../components/i18n';
import ExerciseDateForm from './ExerciseDateForm';
import type { Exercise } from '../../../../utils/api-types';
import Transition from '../../../../components/common/Transition';
import { useAppDispatch } from '../../../../utils/hooks';

interface Props {
  exercise: Exercise;
}

const ExerciseDatePopover: React.FC<Props> = ({ exercise }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const onSubmitEdit = async (data: Pick<Exercise, 'exercise_start_date'>) => {
    await dispatch(updateExerciseStartDate(exercise.exercise_id, data));
    setOpenEdit(false);
  };
  const initialValues = { exercise_start_date: exercise.exercise_start_date };
  return (
    <>
      <Tooltip title={(t('Modify the scheduling'))}>
        <span>
          <IconButton size="small" color="primary" onClick={() => setOpenEdit(true)} style={{ marginRight: 5 }} disabled={exercise.exercise_status !== 'SCHEDULED'}>
            <UpdateOutlined />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog
        TransitionComponent={Transition}
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        PaperProps={{ elevation: 1 }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('Update simulation start date and time')}</DialogTitle>
        <DialogContent>
          <ExerciseDateForm
            initialValues={initialValues}
            onSubmit={onSubmitEdit}
            handleClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseDatePopover;
