import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { updateExerciseStartDate } from '../../../../actions/Exercise';
import { useFormatter } from '../../../../components/i18n';
import ExerciseDateForm from '../ExerciseDateForm';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
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
    <div>
      <IconButton
        onClick={() => setOpenEdit(true)}
        aria-haspopup="true"
        size="small"
        disabled={isExerciseReadOnly(exercise)}
        color="secondary"
      >
        <EditOutlined fontSize="small" />
      </IconButton>
      <Dialog
        TransitionComponent={Transition}
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Update the simulation')}</DialogTitle>
        <DialogContent>
          <ExerciseDateForm
            initialValues={initialValues}
            editing
            onSubmit={onSubmitEdit}
            handleClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseDatePopover;
