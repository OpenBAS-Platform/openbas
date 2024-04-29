import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ExerciseInjectExpectationResultsByTypeStore, ExerciseStore } from '../../../../actions/exercises/Exercise';
import ExerciseDistribution from './ExerciseDistribution';
import ResponsePie from '../../atomic_testings/atomic_testing/ResponsePie';
import { fetchExerciseExpectationResult, fetchExerciseInjectExpectationResults } from '../../../../actions/exercises/exercise-action';
import type { ExpectationResultsByType } from '../../../../utils/api-types';
import MitreMatrix from '../../common/matrix/MitreMatrix';
import Loader from '../../../../components/Loader';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchInjects } from '../../../../actions/Inject';

const Exercise = () => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };
  useDataLoader(() => {
    dispatch(fetchInjects(exerciseId));
  });

  const [results, setResults] = useState<ExpectationResultsByType[] | null>(null);
  const [injectResults, setInjectResults] = useState<ExerciseInjectExpectationResultsByTypeStore[] | null>(null);
  useEffect(() => {
    fetchExerciseExpectationResult(exerciseId).then((result: { data: ExpectationResultsByType[] }) => setResults(result.data));
    fetchExerciseInjectExpectationResults(exerciseId).then((result: { data: ExerciseInjectExpectationResultsByTypeStore[] }) => setInjectResults(result.data));
  }, [exerciseId]);

  const goToLink = `/admin/exercises/${exerciseId}/injects`;

  return (
    <>
      {results == null
        ? <Loader variant="inElement" />
        : <ResponsePie expectations={results} humanValidationLink={`/admin/exercises/${exerciseId}/animation/validations`} />
      }
      {injectResults == null
        ? <Loader variant="inElement" />
        : <div style={{ marginTop: 16, marginBottom: 16 }}>
          <MitreMatrix goToLink={goToLink} injectResults={injectResults} />
        </div>
      }
      <ExerciseDistribution exerciseId={exerciseId} />
    </>
  );
};

export default Exercise;
