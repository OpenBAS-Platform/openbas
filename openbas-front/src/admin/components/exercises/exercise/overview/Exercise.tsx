import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ExerciseInjectExpectationResultsByTypeStore, ExerciseStore } from '../../../../../actions/exercises/Exercise';
import ExerciseDistribution from './ExerciseDistribution';
import ResponsePie from '../../../components/atomic_testings/ResponsePie';
import { fetchExerciseExpectationResult, fetchExerciseInjectExpectationResults } from '../../../../../actions/exercises/exercise-action';
import type { ExpectationResultsByType } from '../../../../../utils/api-types';
import MitreMatrix from '../../../components/matrix/MitreMatrix';
import Loader from '../../../../../components/Loader';

const Exercise = () => {
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };

  const [results, setResults] = useState<ExpectationResultsByType[] | null>(null);
  const [injectResults, setInjectResults] = useState<ExerciseInjectExpectationResultsByTypeStore[] | null>(null);
  useEffect(() => {
    fetchExerciseExpectationResult(exerciseId).then((result: { data: ExpectationResultsByType[] }) => setResults(result.data));
    fetchExerciseInjectExpectationResults(exerciseId).then((result: { data: ExerciseInjectExpectationResultsByTypeStore[] }) => setInjectResults(result.data));
  }, [exerciseId]);

  return (
    <>
      {results == null
        ? <Loader variant="inElement" />
        : <ResponsePie expectations={results} humanValidationLink={`/admin/exercises/${exerciseId}/animation/validations`} />
      }
      {injectResults == null
        ? <Loader variant="inElement" />
        : <div style={{ marginTop: 16, marginBottom: 16 }}>
          <MitreMatrix exerciseId={exerciseId} injectResults={injectResults} />
        </div>
      }
      <ExerciseDistribution exerciseId={exerciseId} />
    </>
  );
};

export default Exercise;
