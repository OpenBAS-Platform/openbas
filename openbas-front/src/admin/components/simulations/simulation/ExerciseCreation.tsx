import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonCreate from '../../../../components/common/ButtonCreate';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ExerciseCreateInput } from '../../../../utils/api-types';
import { addExercise } from '../../../../actions/Exercise';
import ExerciseCreationForm from './ExerciseCreationForm';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';

const ExerciseCreation = () => {
  // Standard hooks
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onSubmit = (data: ExerciseCreateInput) => {
    dispatch(addExercise(data)).then((result: { result: string, entities: { scenarios: Record<string, ExerciseStore> } }) => {
      setOpen(false);
      navigate(`/admin/exercises/${result.result}`);
    });
  };
  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
      <Drawer
        open={open}
        handleClose={() => setOpen(false)}
        title={t('Create a new simulation')}
      >
        <ExerciseCreationForm
          onSubmit={onSubmit}
          handleClose={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
};

export default ExerciseCreation;
