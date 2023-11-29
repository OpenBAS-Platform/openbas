import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { EditOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { updateExerciseStartDate } from '../../../actions/Exercise';
import { useFormatter } from '../../../components/i18n';
import ExerciseDateForm from './ExerciseDateForm';
import { isExerciseReadOnly } from '../../../utils/Exercise';
import { Exercise } from '../../../utils/api-types';
import Transition from '../../../components/common/Transition';
import { useAppDispatch } from '../../../utils/hooks';

const useStyles = makeStyles(() => ({
  button: {
    float: 'left',
    margin: '-15px 0 0 0',
  },
}));

interface Props {
  exercise: Exercise
}

const ExerciseDatePopover: React.FC<Props> = ({ exercise }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const onSubmitEdit = async (data: Pick<Exercise, 'exercise_start_date'>) => {
    await dispatch(updateExerciseStartDate(exercise.exercise_id, data));
    setOpenEdit(false);
  };

  const initialValues = { exercise_start_date: exercise.exercise_start_date };

  return (
    <div>
      <IconButton
        classes={{ root: classes.button }}
        onClick={() => setOpenEdit(true)}
        aria-haspopup="true"
        size="large"
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
        <DialogTitle>{t('Update the exercise')}</DialogTitle>
        <DialogContent>
          <ExerciseDateForm
            initialValues={initialValues}
            editing={true}
            onSubmit={onSubmitEdit}
            handleClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default ExerciseDatePopover;
