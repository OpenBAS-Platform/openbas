import React, { useState } from 'react';
import { Page } from '@playwright/test';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import Breadcrumbs from '../../../components/Breadcrumbs';
import ExerciseCreation from './simulation/ExerciseCreation';
import type { ExercisesHelper } from '../../../actions/exercises/exercise-helper';
import type { UserHelper } from '../../../actions/helper';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import { initSorting } from '../../../components/common/pagination/Page';
import type { ExerciseSimple, SearchPaginationInput } from '../../../utils/api-types';
import type { EndpointStore } from '../assets/endpoints/Endpoint';
import ExerciseList from './ExerciseList';
import { searchExercises } from '../../../actions/Exercise';
import ImportUploaderExercise from './ImportUploaderExercise';

const Exercises = () => {
  // Standard hooks
  const { t } = useFormatter();

  // Fetching data
  const { userAdmin } = useHelper((helper: ExercisesHelper & UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  const [exercises, setExercises] = useState<EndpointStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('exercise_updated_at', 'DESC'),
  });

  const refreshExercises = () => {
    searchExercises(searchPaginationInput).then((result) => {
      const { data } = result;
      setExercises(data.content);
    });
  };

  // Export
  const exportProps = {
    exportType: 'exercise',
    exportKeys: [
      'exercise_name',
      'exercise_subtitle',
      'exercise_description',
      'exercise_status',
      'exercise_tags',
    ],
    exportData: exercises,
    exportFileName: `${t('Simulations')}.csv`,
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Simulations'), current: true }]} />
      <PaginationComponent
        fetch={searchExercises}
        searchPaginationInput={searchPaginationInput}
        setContent={setExercises}
        exportProps={exportProps}
      >
        <ImportUploaderExercise />
      </PaginationComponent>
      <ExerciseList
        exercises={exercises}
        searchPaginationInput={searchPaginationInput}
        setSearchPaginationInput={setSearchPaginationInput}
        onOperationSuccess={refreshExercises}
      />
      {userAdmin && <ExerciseCreation />}
    </>
  );
};

export default Exercises;
