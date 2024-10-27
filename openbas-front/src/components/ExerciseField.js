import { useDispatch } from 'react-redux';
import { Kayaking } from '@mui/icons-material';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Autocomplete from './Autocomplete';
import useDataLoader from '../utils/hooks/useDataLoader';
import { useHelper } from '../store';
import { fetchExercises } from '../actions/Exercise';

const useStyles = makeStyles(() => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
}));

/**
 * @deprecated The component use old form libnary react-final-form
 */
const ExerciseField = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const exercises = useHelper((helper) => helper.getExercises());
  useDataLoader(() => {
    dispatch(fetchExercises());
  });
  const { name, onKeyDown, style, label, placeholder } = props;
  const exerciseOptions = (exercises || []).map((n) => ({
    id: n.exercise_id,
    label: n.exercise_name,
  }));
  return (
    <Autocomplete
      variant="standard"
      size="small"
      name={name}
      fullWidth
      multiple
      label={label}
      placeholder={placeholder}
      options={exerciseOptions}
      style={style}
      onKeyDown={onKeyDown}
      renderOption={(renderProps, option) => (
        <Box component="li" {...renderProps} key={option.id}>
          <div className={classes.icon}>
            <Kayaking />
          </div>
          <div className={classes.text}>{option.label}</div>
        </Box>
      )}
      classes={{ clearIndicator: classes.autoCompleteIndicator }}
    />
  );
};

export default ExerciseField;
