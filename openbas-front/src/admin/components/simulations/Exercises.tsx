import React, { useState } from 'react';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import Breadcrumbs from '../../../components/Breadcrumbs';
import ExerciseCreation from './simulation/ExerciseCreation';
import type { ExercisesHelper } from '../../../actions/exercises/exercise-helper';
import type { UserHelper } from '../../../actions/helper';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import { initSorting } from '../../../components/common/queryable/Page';
import type { SearchPaginationInput } from '../../../utils/api-types';
import type { EndpointStore } from '../assets/endpoints/Endpoint';
import ExerciseList from './ExerciseList';
import { searchExercises } from '../../../actions/Exercise';
import ImportUploaderExercise from './ImportUploaderExercise';
import { buildSearchPagination } from '../../../components/common/queryable/useQueryable';
import ExercisePopover from './simulation/ExercisePopover';
import type { ExerciseStore } from '../../../actions/exercises/Exercise';

const Exercises = () => {
  // Standard hooks
  const { t } = useFormatter();

  // Fetching data
  const { userAdmin } = useHelper((helper: ExercisesHelper & UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  const [exercises, setExercises] = useState<EndpointStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>(buildSearchPagination({
    sorts: initSorting('exercise_updated_at', 'DESC'),
  }));

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

  const secondaryAction = (exercise: ExerciseStore) => (
    <ExercisePopover
      exercise={exercise}
      actions={['Duplicate', 'Export', 'Delete']}
      onDelete={(result) => setExercises(exercises.filter((e) => (e.exercise_id !== result)))}
      inList
    />
  );

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
        secondaryAction={secondaryAction}
      />
      {userAdmin && <ExerciseCreation />}
    </>
  );
};

export default Exercises;
