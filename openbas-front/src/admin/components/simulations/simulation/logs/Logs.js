import React, { useEffect, useRef, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { EditOutlined, ExpandMoreOutlined, RateReviewOutlined } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Card, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { addLog, fetchLogs } from '../../../../../actions/Log';
import LogPopover from './LogPopover';
import { resolveUserName } from '../../../../../utils/String';
import ItemTags from '../../../../../components/ItemTags';
import LogForm from './LogForm';
import { isExerciseUpdatable } from '../../../../../utils/Exercise';
import AnimationMenu from '../AnimationMenu';
import { fetchExerciseObjectives } from '../../../../../actions/Objective';

const useStyles = makeStyles(() => ({
  card: {
    width: '100%',
    height: '100%',
    marginBottom: 30,
    borderRadius: 6,
    padding: 0,
    position: 'relative',
  },
  heading: {
    display: 'flex',
  },
}));

const Logs = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t, nsdt } = useFormatter();
  const [openCreateLog, setOpenCreateLog] = useState(false);
  const bottomRef = useRef(null);
  // Fetching data
  const { exerciseId } = useParams();
  const { exercise, logs, usersMap } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      logs: helper.getExerciseLogs(exerciseId),
      usersMap: helper.getUsersMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchExerciseObjectives(exerciseId));
    dispatch(fetchLogs(exerciseId));
  });
  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };
  const handleToggleWrite = () => setOpenCreateLog(!openCreateLog);
  useEffect(() => {
    if (openCreateLog) {
      scrollToBottom();
    }
  }, [openCreateLog]);
  const submitCreateLog = (data, action) => {
    const inputValues = R.pipe(
      R.assoc('log_tags', R.pluck('id', data.log_tags)),
    )(data);
    return dispatch(addLog(exerciseId, inputValues)).then((result) => {
      if (result.result) {
        action.reset();
        action.resetFieldState('log_title');
        action.resetFieldState('log_content');
        return handleToggleWrite();
      }
      return result;
    });
  };
  return (
    <div style={{ marginTop: -13 }}>
      <AnimationMenu exerciseId={exerciseId}/>
      <div>
        <Typography variant="h4" style={{ float: 'left' }}>
          {t('Simulation logs')}
        </Typography>
        {isExerciseUpdatable(exercise, true) && (
        <IconButton
          color="secondary"
          onClick={handleToggleWrite}
          size="large"
          style={{ margin: '-15px 0 0 5px' }}
        >
          <EditOutlined fontSize="small"/>
        </IconButton>
        )}
        {logs.map((log) => (
          <Card
            key={log.log_id}
            classes={{ root: classes.card }}
            raised={false}
            variant="outlined"
          >
            <CardHeader
              style={{
                padding: '7px 10px 2px 15px',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
              action={<LogPopover exerciseId={exerciseId} log={log}/>}
              title={
                <div>
                  <div
                    style={{
                      float: 'left',
                      fontDecoration: 'none',
                      textTransform: 'none',
                      paddingTop: 7,
                      fontSize: 15,
                    }}
                  >
                    <strong>
                      {resolveUserName(usersMap[log.log_user] ?? {})}
                    </strong>
                                        &nbsp;
                    <span style={{ color: theme.palette.text.secondary }}>
                      {t('added an entry on')} {nsdt(log.log_created_at)}
                    </span>
                  </div>
                  <div
                    style={{
                      float: 'left',
                      margin: '4px 0 0 20px',
                      fontDecoration: 'none',
                      textTransform: 'none',
                    }}
                  >
                    <ItemTags tags={log.log_tags}/>
                  </div>
                </div>
                            }
            />
            <CardContent>
              <strong>{log.log_title}</strong>
              <p>{log.log_content}</p>
            </CardContent>
          </Card>
        ))}
        {isExerciseUpdatable(exercise, true) && (
        <Accordion
          style={{ margin: `${logs.length > 0 ? '30' : '5'}px 0 30px 0` }}
          expanded={openCreateLog}
          onChange={handleToggleWrite}
          variant="outlined"
        >
          <AccordionSummary expandIcon={<ExpandMoreOutlined/>}>
            <Typography className={classes.heading}>
              <RateReviewOutlined/>
                                &nbsp;&nbsp;&nbsp;&nbsp;
              <span style={{ fontWeight: 500 }}>{t('Write an entry')}</span>
            </Typography>
          </AccordionSummary>
          <AccordionDetails style={{ width: '100%', paddingBottom: 80 }}>
            <LogForm
              initialValues={{ log_tags: [] }}
              onSubmit={submitCreateLog}
              handleClose={() => setOpenCreateLog(false)}
            />
          </AccordionDetails>
        </Accordion>
        )}
        <div style={{ marginTop: 100 }}/>
        <div ref={bottomRef}/>
      </div>
    </div>
  );
};

export default Logs;
