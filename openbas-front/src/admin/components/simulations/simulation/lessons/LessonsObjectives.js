import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, LinearProgress } from '@mui/material';
import { FlagOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import Chart from 'react-apexcharts';
import CreateObjective from './CreateObjective';
import { useFormatter } from '../../../../../components/i18n';
import Empty from '../../../../../components/Empty';
import ObjectivePopover from './ObjectivePopover';
import { isExerciseUpdatable } from '../../../../../utils/Exercise';
import { areaChartOptions } from '../../../../../utils/Charts';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
    overflow: 'hidden',
    height: '100%',
  },
}));

const LessonsObjectives = ({
  objectives,
  exercise,
  injects,
  setSelectedObjective,
  isReport,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t, nsdt } = useFormatter();
  const sortedObjectives = R.sortWith(
    [R.ascend(R.prop('objective_priority'))],
    objectives,
  );
  const injectsData = R.pipe(
    R.filter((n) => n.inject_sent_at !== null),
    R.map((n) => {
      const date = new Date(n.inject_sent_at);
      date.setHours(0, 0, 0, 0);
      return R.assoc('inject_sent_at_date', date.toISOString(), n);
    }),
    R.groupBy(R.prop('inject_sent_at_date')),
    R.toPairs,
    R.map((n) => ({
      x: n[0],
      y: n[1].length,
    })),
  )(injects);
  const chartData = [
    {
      name: t('Number of injects'),
      data: injectsData,
    },
  ];
  return (
    <Grid container={true} spacing={3} style={{ marginTop: -10 }}>
      <Grid item={true} xs={6}>
        <Typography variant="h4" style={{ float: 'left' }}>
          {t('Objectives')}
        </Typography>
        {isExerciseUpdatable(exercise, true) && !isReport && (
          <CreateObjective exerciseId={exercise.exercise_id} />
        )}
        <div className="clearfix" />
        <Paper variant="outlined" classes={{ root: classes.paper }}>
          {sortedObjectives.length > 0 ? (
            <List style={{ padding: 0 }}>
              {sortedObjectives.map((objective) => (
                <ListItem
                  key={objective.objective_id}
                  divider={true}
                  button={true}
                  onClick={() => setSelectedObjective
                    && setSelectedObjective(objective.objective_id)
                  }
                >
                  <ListItemIcon>
                    <FlagOutlined />
                  </ListItemIcon>
                  <ListItemText
                    style={{ width: '50%' }}
                    primary={objective.objective_title}
                    secondary={objective.objective_description}
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
                        value={objective.objective_score}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {objective.objective_score}%
                      </Typography>
                    </Box>
                  </Box>
                  {!isReport && (
                    <ListItemSecondaryAction>
                      <ObjectivePopover
                        exercise={exercise}
                        objective={objective}
                      />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Empty message={t('No objectives in this simulation.')} />
          )}
        </Paper>
      </Grid>
      <Grid item={true} xs={6}>
        <Typography variant="h4">
          {t('Crisis intensity (injects by hour)')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {injectsData.length > 0 ? (
            <Chart
              options={areaChartOptions(theme, true, nsdt, null, undefined)}
              series={chartData}
              type="area"
              width="100%"
              height={350}
            />
          ) : (
            <Empty
              message={t(
                'No data to display or the simulation has not started yet',
              )}
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LessonsObjectives;
