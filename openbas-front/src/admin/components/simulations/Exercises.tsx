import React, { useState } from 'react';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import Breadcrumbs from '../../../components/Breadcrumbs';
import ExerciseCreation from './simulation/ExerciseCreation';
import type { ExercisesHelper } from '../../../actions/exercises/exercise-helper';
import type { UserHelper } from '../../../actions/helper';
import { initSorting } from '../../../components/common/queryable/Page';
import type { EndpointStore } from '../assets/endpoints/Endpoint';
import ExerciseList from './ExerciseList';
import { searchExercises } from '../../../actions/Exercise';
import ImportUploaderExercise from './ImportUploaderExercise';
import { buildSearchPagination } from '../../../components/common/queryable/QueryableUtils';
import useQueryable from '../../../components/common/queryable/useQueryable';
import PaginationComponentV2 from '../../../components/common/queryable/pagination/PaginationComponentV2';
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
  const { queryableHelpers, searchPaginationInput } = useQueryable('simulations', buildSearchPagination({
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
      <PaginationComponentV2
        fetch={searchExercises}
        searchPaginationInput={searchPaginationInput}
        setContent={setExercises}
        entityPrefix="exercise"
        availableFilterNames={['exercise_kill_chain_phases', 'exercise_scenario', 'exercise_tags']}
        queryableHelpers={queryableHelpers}
        exportProps={exportProps}
      >
        <ImportUploaderExercise />
      </PaginationComponentV2>
      <ExerciseList
        exercises={exercises}
        queryableHelpers={queryableHelpers}
        secondaryAction={secondaryAction}
      />
      {userAdmin && <ExerciseCreation />}
    </>
  );
};

export default Exercises;
