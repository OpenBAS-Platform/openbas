import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addExercise } from '../../../../actions/Exercise';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import ButtonCreate from '../../../../components/common/ButtonCreate';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { ExerciseCreateInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import ExerciseCreationForm from './ExerciseCreationForm';

const ExerciseCreation = () => {
  // Standard hooks
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onSubmit = (data: ExerciseCreateInput) => {
    dispatch(addExercise(data)).then((result: { result: string; entities: { scenarios: Record<string, ExerciseStore> } }) => {
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
