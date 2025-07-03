import { Autocomplete, TextField } from '@mui/material';

import { fetchExercises } from '../../actions/Exercise';
import { type ExercisesHelper } from '../../actions/exercises/exercise-helper';
import { useHelper } from '../../store';
import { type Exercise } from '../../utils/api-types';
import { useAppDispatch } from '../../utils/hooks';
import useDataLoader from '../../utils/hooks/useDataLoader';
import { useFormatter } from '../i18n';

interface Props {
  value: string;
  className?: string;
  onChange: (exerciseId: string) => void;
}

const ExerciseField = ({ value, className, onChange }: Props) => {
  const dispatch = useAppDispatch();
  const { fldt } = useFormatter();

  const exercises: Exercise[] = useHelper((helper: ExercisesHelper) => helper.getExercises());
  useDataLoader(() => {
    dispatch(fetchExercises());
  });

  const formattedLabel = (exercise: Exercise) => {
    return `[${fldt(exercise.exercise_updated_at)}] ${exercise.exercise_name}`;
  };

  const exerciseOptions = (exercises ?? []).map(n => ({
    id: n.exercise_id,
    label: formattedLabel(n),
  }));

  return (
    <Autocomplete
      options={exerciseOptions}
      className={className}
      multiple={false}
      onChange={(_event, pattern) => {
        if (pattern) {
          onChange(pattern.id);
        }
      }}
      value={exerciseOptions.find(n => n.id === value) ?? null}
      renderInput={params => (
        <TextField {...params} label="Exercise" variant="standard" fullWidth />
      )}
    />
  );
};

export default ExerciseField;
