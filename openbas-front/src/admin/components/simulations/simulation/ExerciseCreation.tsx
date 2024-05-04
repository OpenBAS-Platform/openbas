import React, { useState } from 'react';
import ButtonCreate from '../../../../components/common/ButtonCreate';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ExerciseCreateInput } from '../../../../utils/api-types';
import { addExercise } from '../../../../actions/Exercise';
import ExerciseCreationForm from './ExerciseCreationForm';

const ExerciseCreation = () => {
  // Standard hooks
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const onSubmit = (data: ExerciseCreateInput) => {
    dispatch(addExercise(data));
    setOpen(false);
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
