import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { PreviewOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import Empty from '../../../../../components/Empty';
import SearchFilter from '../../../../../components/SearchFilter';
import TagsFilter from '../../../common/filters/TagsFilter';
import useSearchAnFilter from '../../../../../utils/SortingFiltering';
import InjectIcon from '../../../common/injects/InjectIcon';
import InjectPopover from '../../../common/injects/InjectPopover';
import ProgressBarCountdown from '../../../../../components/ProgressBarCountdown';
import AnimationMenu from '../AnimationMenu';
import InjectOverTimeArea from './InjectOverTimeArea';
import InjectOverTimeLine from './InjectOverTimeLine';
import UpdateInject from '../../../common/injects/UpdateInject';
import ItemStatus from '../../../../../components/ItemStatus';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import type { Exercise, Inject } from '../../../../../utils/api-types';
import type { TagHelper } from '../../../../../actions/helper';
import type { InjectStore } from '../../../../../actions/injects/Inject';
import { updateInjectForExercise } from '../../../../../actions/Inject';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    margin: '-12px 0 50px 0',
  },
  paperChart: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: 15,
    borderRadius: 4,
  },
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  item: {
    height: 50,
    minHeight: 50,
    maxHeight: 50,
    paddingRight: 0,
  },
  bodyItems: {
    display: 'flex',
    alignItems: 'center',
  },
  bodyItem: {
    height: '100%',
    fontSize: 14,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const TimelineOverview = () => {
  const classes = useStyles();
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const { t, fndt } = useFormatter();
  const [selectedInjectId, setSelectedInjectId] = useState<string | null>(null);

  const {
    exercise,
    teams,
    injects,
    tagsMap,
    selectedInject,
  } = useHelper((helper: InjectHelper & TeamsHelper & ExercisesHelper & TagHelper) => {
    const exerciseTeams = helper.getExerciseTeams(exerciseId);
    const injectsPerTeam = R.mergeAll(
      exerciseTeams.map((a) => ({
        [a.team_id]: helper.getTeamExerciseInjects(a.team_id),
      })),
    );
    const techicalInjectsWithNoTeam = helper.getExerciseTechnicalInjectsWithNoTeam(exerciseId);
    const technicalInjectsPerType = R.groupBy(R.prop('inject_type'))(techicalInjectsWithNoTeam);
    return {
      exercise: helper.getExercise(exerciseId),
      injects: helper.getExerciseInjects(exerciseId),
      teams: exerciseTeams,
      exercisesMap: helper.getExercisesMap(),
      tagsMap: helper.getTagsMap(),
      teamsInjectsMap: injectsPerTeam,
      technicalInjectsMap: technicalInjectsPerType,
      selectedInject: selectedInjectId && helper.getInject(selectedInjectId),
    };
  });

  // Filter and sort hook
  const searchColumns = ['title', 'description', 'content'];
  const filtering = useSearchAnFilter(
    'inject',
    'depends_duration',
    searchColumns,
  );

  const pendingInjects = R.sortWith(
    [R.ascend(R.prop('inject_depends_duration'))],
    injects.filter((i: InjectStore) => i.inject_status === null),
  );
  const processedInjects = R.sortWith(
    [R.descend(R.prop('inject_depends_duration'))],
    injects.filter((i: InjectStore) => i.inject_status !== null),
  );

  const onUpdateInject = async (inject: Inject) => {
    if (selectedInjectId) {
      updateInjectForExercise(exerciseId, selectedInjectId, inject);
    }
  };

  return (
    <div className={classes.root}>
      <AnimationMenu exerciseId={exerciseId}/>
      <>
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
      </>
      <div className="clearfix"/>
      <Grid container spacing={3} style={{ marginTop: 50, paddingBottom: 24 }}>
        <Grid container item spacing={3}>
          <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4">{t('Pending injects')}</Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              {pendingInjects.length > 0 ? (
                <List style={{ paddingTop: 0 }}>
                  {pendingInjects.map((inject: InjectStore) => {
                    const isDisabled = !inject.inject_injector_contract.injector_contract_content_parsed?.config.expose;
                    return (
                      <ListItem
                        key={inject.inject_id}
                        dense={true}
                        classes={{ root: classes.item }}
                        divider={true}
                        button={true}
                        disabled={isDisabled || !inject.inject_enabled}
                        onClick={() => setSelectedInjectId(inject.inject_id)}
                      >
                        <ListItemIcon>
                          <InjectIcon
                            type={inject.inject_type}
                            variant="inline"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <div className={classes.bodyItems}>
                              <div
                                className={classes.bodyItem}
                                style={{ width: '50%' }}
                              >
                                {inject.inject_title}
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{ width: '20%' }}
                              >
                                <ProgressBarCountdown
                                  date={inject.inject_date}
                                  paused={
                                    exercise?.exercise_status === 'PAUSED'
                                    || exercise?.exercise_status === 'CANCELED'
                                  }
                                />
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{
                                  fontFamily: 'Consolas, monaco, monospace',
                                  fontSize: 12,
                                }}
                              >
                                {fndt(inject.inject_date)}
                              </div>
                            </div>
                                }
                        />
                        <ListItemSecondaryAction>
                          <InjectPopover
                            inject={inject}
                            tagsMap={tagsMap}
                            setSelectedInjectId={setSelectedInjectId}
                            isDisabled={isDisabled}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Empty message={t('No pending injects in this simulation.')}/>
              )}
            </Paper>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4">{t('Processed injects')}</Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              {processedInjects.length > 0 ? (
                <List style={{ paddingTop: 0 }}>
                  {processedInjects.map((inject: InjectStore) => (
                    <ListItemButton
                      key={inject.inject_id}
                      dense
                      classes={{ root: classes.item }}
                      divider
                      component={Link}
                      to={`/admin/exercises/${exerciseId}/injects/${inject.inject_id}?backlabel=Animation&backuri=/admin/exercises/${exerciseId}/animation/timeline`}
                    >
                      <ListItemIcon>
                        <InjectIcon type={inject.inject_type} variant="inline"/>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <div className={classes.bodyItems}>
                            <div
                              className={classes.bodyItem}
                              style={{ width: '40%' }}
                            >
                              {inject.inject_title}
                            </div>
                            <div
                              className={classes.bodyItem}
                              style={{ width: '20%' }}
                            >
                              <ItemStatus
                                variant="inList"
                                label={t(inject.inject_status?.status_name)}
                                status={inject.inject_status?.status_name}
                              />
                            </div>
                            <div
                              className={classes.bodyItem}
                              style={{ fontFamily: 'Consolas, monaco, monospace', fontSize: 12 }}
                            >
                              {fndt(inject.inject_status?.tracking_sent_date)} (
                              {inject.inject_status && inject.inject_status.tracking_total_execution_time && (inject.inject_status.tracking_total_execution_time / 1000).toFixed(2)}
                              s)
                            </div>
                          </div>
                        }
                      />
                      <ListItemSecondaryAction>
                        <PreviewOutlined/>
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Empty message={t('No processed injects in this simulation.')}/>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid container={true} spacing={3}>
        <Grid item xs={6}>
          <Typography variant="h4">
            {t('Sent injects over time')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <InjectOverTimeArea exerciseId={exerciseId}/>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h4">
            {t('Sent injects over time')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <InjectOverTimeLine exerciseId={exerciseId}/>
          </Paper>
        </Grid>
      </Grid>
      {selectedInject && (
        <UpdateInject
          open={selectedInjectId !== null}
          handleClose={() => setSelectedInjectId(null)}
          onUpdateInject={onUpdateInject}
          injectorContract={selectedInject.inject_injector_contract.injector_contract_content_parsed}
          inject={selectedInject}
          teamsFromExerciseOrScenario={teams}
          isAtomic={false}
        />
      )}
    </div>
  );
};
export default TimelineOverview;
