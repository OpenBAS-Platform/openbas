import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Grid, LinearProgress, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material';
import { FlagOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { useFormatter } from '../../../../components/i18n';
import CreateObjective from '../CreateObjective';
import ObjectivePopover from '../ObjectivePopover';
import Empty from '../../../../components/Empty';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    height: '250px',
    overflow: 'auto',
  },
}));

const LessonsObjectives = ({
  objectives,
  source,
  setSelectedObjective,
  isReport,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const sortedObjectives = R.sortWith(
    [R.ascend(R.prop('objective_priority'))],
    objectives,
  );
  return (
    <Grid container spacing={1} style={{ marginTop: -10 }}>
      <Grid item xs={12}>
        <Typography variant="h4" style={{ float: 'left' }}>
          {t('Objectives')}
        </Typography>
        {source.isUpdatable && !isReport && (
          <CreateObjective />
        )}
        <div className="clearfix" />
        <Paper variant="outlined" classes={{ root: classes.paper }}>
          {sortedObjectives.length > 0 ? (
            <List style={{ padding: 0 }}>
              {sortedObjectives.map((objective) => (
                <ListItem
                  key={objective.objective_id}
                  divider
                  button
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
                        isReadOnly={source.isReadOnly}
                        objective={objective}
                      />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Empty message={t(`No objectives in this ${source.type}.`)} />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LessonsObjectives;
