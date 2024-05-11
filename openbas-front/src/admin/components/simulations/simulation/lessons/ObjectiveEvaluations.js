import React, { useState } from 'react';
import { Box, Typography, Slider, List, ListItem, ListItemIcon, ListItemText, LinearProgress, Button } from '@mui/material';
import { HowToVoteOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { addEvaluation, fetchEvaluations, updateEvaluation } from '../../../../../actions/Evaluation';
import { resolveUserName } from '../../../../../utils/String';
import Loader from '../../../../../components/Loader';
import { isExerciseUpdatable } from '../../../../../utils/Exercise';

const ObjectiveEvaluations = ({ objectiveId, handleClose }) => {
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [value, setValue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Fetching data
  const { exerciseId } = useParams();
  const { me, exercise, objective, evaluations, usersMap } = useHelper(
    (helper) => {
      return {
        me: helper.getMe(),
        usersMap: helper.getUsersMap(),
        exercise: helper.getExercise(exerciseId),
        objective: helper.getObjective(objectiveId),
        evaluations: helper.getObjectiveEvaluations(objectiveId),
      };
    },
  );
  useDataLoader(() => {
    dispatch(fetchEvaluations(exerciseId, objectiveId));
  });
  const currentUserEvaluation = R.head(
    R.filter((n) => n.evaluation_user === me.user_id, evaluations),
  );
  const submitEvaluation = () => {
    setSubmitting(true);
    const data = {
      evaluation_score: value,
    };
    if (currentUserEvaluation) {
      return dispatch(
        updateEvaluation(
          exerciseId,
          objectiveId,
          currentUserEvaluation.evaluation_id,
          data,
        ),
      ).then((result) => {
        if (result.result) {
          return handleClose();
        }
        return result;
      });
    }
    return dispatch(addEvaluation(exerciseId, objectiveId, data)).then(
      (result) => {
        if (result.result) {
          return handleClose();
        }
        return result;
      },
    );
  };
  if (!objective) {
    return <Loader />;
  }
  return (
    <div>
      {evaluations.length > 0 ? (
        <List style={{ padding: 0 }}>
          {evaluations.map((evaluation) => (
            <ListItem key={evaluation.evaluation_id} divider={true}>
              <ListItemIcon>
                <HowToVoteOutlined />
              </ListItemIcon>
              <ListItemText
                style={{ width: '50%' }}
                primary={resolveUserName(usersMap[evaluation.evaluation_user])}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '30%',
                  marginRight: 1,
                }}
              >
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={evaluation.evaluation_score}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {evaluation.evaluation_score}%
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <List style={{ padding: 0 }}>
          <ListItem divider={true}>
            <ListItemIcon>
              <HowToVoteOutlined />
            </ListItemIcon>
            <ListItemText
              style={{ width: '50%' }}
              primary={
                <i>{t('There is no evaluation for this objective yet')}</i>
              }
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '30%',
                marginRight: 1,
              }}
            >
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={0} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  -
                </Typography>
              </Box>
            </Box>
          </ListItem>
        </List>
      )}
      {isExerciseUpdatable(exercise, true) && (
        <Box
          sx={{
            width: '100%',
            marginTop: '30px',
            padding: '0 5px 0 5px',
          }}
        >
          <Typography variant="h4">{t('My evaluation')}</Typography>
          <Slider
            aria-label={t('Score')}
            value={
              value === null
                ? currentUserEvaluation?.evaluation_score || 10
                : value
            }
            onChange={(_, val) => setValue(val)}
            valueLabelDisplay="auto"
            step={5}
            marks={true}
            min={10}
            max={100}
          />
        </Box>
      )}
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          onClick={handleClose}
          style={{ marginRight: isExerciseUpdatable(exercise, true) ? 10 : 0 }}
          disabled={submitting}
        >
          {isExerciseUpdatable(exercise, true) ? t('Cancel') : t('Close')}
        </Button>
        {isExerciseUpdatable(exercise, true) && (
          <Button
            color="secondary"
            onClick={submitEvaluation}
            disabled={submitting}
          >
            {t('Evaluate')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ObjectiveEvaluations;
