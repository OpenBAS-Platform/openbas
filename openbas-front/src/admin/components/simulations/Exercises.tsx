import React, { useState } from 'react';
import { ToggleButtonGroup } from '@mui/material';
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
import { useQueryableWithLocalStorage } from '../../../components/common/queryable/useQueryableWithLocalStorage';
import PaginationComponentV2 from '../../../components/common/queryable/pagination/PaginationComponentV2';
import ExercisePopover from './simulation/ExercisePopover';
import type { ExerciseStore } from '../../../actions/exercises/Exercise';
import type { FilterGroup } from '../../../utils/api-types';
import { buildEmptyFilter } from '../../../components/common/queryable/filter/FilterUtils';
import ExportButton from '../../../components/common/ExportButton';

const Exercises = () => {
  // Standard hooks
  const { t } = useFormatter();

  // Fetching data
  const { userAdmin } = useHelper((helper: ExercisesHelper & UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  const [exercises, setExercises] = useState<EndpointStore[]>([]);

  // Filters
  const availableFilterNames = [
    'exercise_kill_chain_phases',
    'exercise_name',
    'exercise_scenario',
    'exercise_start_date',
    'exercise_status',
    'exercise_tags',
    'exercise_updated_at',
  ];

  const quickFilter: FilterGroup = {
    mode: 'and',
    filters: [
      buildEmptyFilter('exercise_kill_chain_phases', 'contains'),
      buildEmptyFilter('exercise_scenario', 'contains'),
      buildEmptyFilter('exercise_tags', 'contains'),
    ],
  };
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('simulations', buildSearchPagination({
    sorts: initSorting('exercise_updated_at', 'DESC'),
    filterGroup: quickFilter,
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
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
        topBarButtons={
          <ToggleButtonGroup value="fake" exclusive>
            <ExportButton totalElements={queryableHelpers.paginationHelpers.getTotalElements()} exportProps={exportProps} />
            <ImportUploaderExercise />
          </ToggleButtonGroup>
        }
      />
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
