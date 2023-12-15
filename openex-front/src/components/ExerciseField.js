import React from 'react';
import { useDispatch } from 'react-redux';
import { Kayaking } from '@mui/icons-material';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Autocomplete from './Autocomplete';
import useDataLoader from '../utils/ServerSideEvent';
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

const ExerciseField = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const exercises = useHelper((helper) => helper.getExercises());

  useDataLoader(() => {
    dispatch(fetchExercises());
  });

  const { name, onKeyDown, style, label, placeholder, noMargin } = props;
  const exerciseOptions = (exercises || []).map((n) => ({
    id: n.exercise_id,
    label: n.exercise_name,
  }));

  return (
    <div>
      <Autocomplete
        variant="standard"
        size="small"
        name={name}
        noMargin={noMargin}
        fullWidth={true}
        multiple={true}
        label={label}
        placeholder={placeholder}
        options={exerciseOptions}
        style={style}
        onKeyDown={onKeyDown}
        renderOption={(renderProps, option) => (
          <Box component="li" {...renderProps}>
            <div className={classes.icon}>
              <Kayaking />
            </div>
            <div className={classes.text}>{option.label}</div>
          </Box>
        )}
        classes={{ clearIndicator: classes.autoCompleteIndicator }}
      />
    </div>
  );
};

export default ExerciseField;
