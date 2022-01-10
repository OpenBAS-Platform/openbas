import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CastForEducationOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import LinearProgress from '@mui/material/LinearProgress';
import Countdown from 'react-countdown';
import { useFormatter } from '../../../../components/i18n';
import { useStore } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchAudiences } from '../../../../actions/Audience';
import { fetchInjects } from '../../../../actions/Inject';
import Empty from '../../../../components/Empty';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import InjectIcon from '../injects/InjectIcon';
import { splitDuration } from '../../../../utils/Time';
import InjectPopover from '../injects/InjectPopover';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    flexGrow: 1,
    paddingBottom: 50,
    overflowX: 'hidden',
  },
  container: {
    marginTop: 60,
    paddingRight: 40,
  },
  names: {
    float: 'left',
    width: '10%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lineName: {
    width: '100%',
    height: 50,
    lineHeight: '50px',
  },
  name: {
    fontSize: 14,
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
  },
  timeline: {
    float: 'left',
    width: '90%',
    position: 'relative',
  },
  line: {
    position: 'relative',
    width: '100%',
    height: 50,
    lineHeight: '50px',
    padding: '0 20px 0 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    verticalAlign: 'middle',
  },
  scale: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  tick: {
    position: 'absolute',
    width: 1,
  },
  tickLabelTop: {
    position: 'absolute',
    left: -28,
    top: '-8%',
    width: 100,
    fontSize: 10,
  },
  tickLabelBottom: {
    position: 'absolute',
    left: -28,
    bottom: '-8%',
    width: 100,
    fontSize: 10,
  },
  injectGroup: {
    position: 'absolute',
    padding: '6px 5px 0 5px',
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
  bodyItem: {
    height: '100%',
    fontSize: 14,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  countdown: {
    fontWeight: 600,
  },
}));

const date = Date.now();

const Animation = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const { t } = useFormatter();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const { audiences, injects } = exercise;
  const [currentDate, setCurrentDate] = useState(Date.now());
  useEffect(() => {
    setInterval(() => setCurrentDate(Date.now()), 1000);
  }, []);
  useDataLoader(() => {
    dispatch(fetchAudiences(exerciseId));
    dispatch(fetchInjects(exerciseId));
  });
  // Filter and sort hook
  const searchColumns = ['title', 'description', 'content'];
  const filtering = useSearchAnFilter(
    'inject',
    'depends_duration',
    searchColumns,
  );
  const lastInject = R.pipe(
    R.sortWith([R.descend(R.prop('inject_depends_duration'))]),
    R.head,
  )(injects);
  const totalDuration = lastInject
    ? lastInject.inject_depends_duration + 3600
    : 60;
  const tickDuration = Math.round(totalDuration / 20);
  const ticks = [...Array(21)].map((_, i) => tickDuration * i);
  // eslint-disable-next-line consistent-return
  const byTick = R.groupBy((inject) => {
    const duration = inject.inject_depends_duration;
    for (const tick of ticks) {
      if (duration < tick) {
        return tick - tickDuration;
      }
    }
  });
  const pendingInjects = injects.filter((i) => i.inject_status === null);
  const processedInjects = injects.filter((i) => i.inject_status !== null);
  return (
    <div className={classes.root}>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
      </div>
      <div className="clearfix" />
      {audiences.length > 0 ? (
        <div className={classes.container}>
          <div className={classes.names}>
            {audiences.map((audience) => (
              <div key={audience.audience_id} className={classes.lineName}>
                <div className={classes.name}>
                  <CastForEducationOutlined fontSize="small" />
                  &nbsp;&nbsp;
                  {audience.audience_name}
                </div>
              </div>
            ))}
          </div>
          <div className={classes.timeline}>
            {audiences.map((audience, index) => {
              const injectsGroupedByTick = byTick(
                filtering.filterAndSort(audience.injects),
              );
              return (
                <div
                  key={audience.audience_id}
                  className={classes.line}
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(255,255,255,0)',
                  }}
                >
                  {Object.keys(injectsGroupedByTick).map((key, i) => {
                    const injectGroupPosition = (key * 100) / totalDuration;
                    return (
                      <div
                        key={i}
                        className={classes.injectGroup}
                        style={{ left: `${injectGroupPosition}%` }}
                      >
                        {injectsGroupedByTick[key].map((inject) => (
                          <InjectIcon
                            key={inject.inject_id}
                            type={inject.inject_type}
                            tooltip={inject.inject_title}
                            size="small"
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div className={classes.scale}>
              {ticks.map((tick, index) => {
                const duration = splitDuration(tick);
                return (
                  <div
                    key={tick}
                    className={classes.tick}
                    style={{
                      left: `${index * 5}%`,
                      height: index % 5 === 0 ? '110%' : '100%',
                      top: index % 5 === 0 ? '-5%' : 0,
                      borderRight:
                        index % 5 === 0
                          ? '1px solid rgba(255, 255, 255, 0.25)'
                          : '1px dashed rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <div className={classes.tickLabelTop}>
                      {index % 5 === 0
                        ? `${duration.days}
                        ${t('d')}, ${duration.hours}
                        ${t('h')}, ${duration.minutes}
                        ${t('m')}`
                        : ''}
                    </div>
                    <div className={classes.tickLabelBottom}>
                      {index % 5 === 0
                        ? `${duration.days}
                        ${t('d')}, ${duration.hours}
                        ${t('h')}, ${duration.minutes}
                        ${t('m')}`
                        : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.container}>
          <div className={classes.names}>
            <div className={classes.lineName}>
              <div className={classes.name}>
                <CastForEducationOutlined fontSize="small" />
                &nbsp;&nbsp;
                {t('No audience')}
              </div>
            </div>
          </div>
          <div className={classes.timeline}>
            <div className={classes.line}> &nbsp; </div>
            <div className={classes.scale}>
              {ticks.map((tick, index) => {
                const duration = splitDuration(tick);
                return (
                  <div
                    key={tick}
                    className={classes.tick}
                    style={{
                      left: `${index * 5}%`,
                      height: index % 5 === 0 ? '110%' : '100%',
                      top: index % 5 === 0 ? '-5%' : 0,
                      borderRight:
                        index % 5 === 0
                          ? '1px solid rgba(255, 255, 255, 0.25)'
                          : '1px dashed rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <div className={classes.tickLabelTop}>
                      {index % 5 === 0
                        ? `${duration.days}
                        ${t('d')}, ${duration.hours}
                        ${t('h')}, ${duration.minutes}
                        ${t('m')}`
                        : ''}
                    </div>
                    <div className={classes.tickLabelBottom}>
                      {index % 5 === 0
                        ? `${duration.days}
                        ${t('d')}, ${duration.hours}
                        ${t('h')}, ${duration.minutes}
                        ${t('m')}`
                        : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="clearfix" />
      <Grid container={true} spacing={3} style={{ marginTop: 50 }}>
        <Grid item={true} xs={6}>
          <Typography variant="overline">{t('Pending injects')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {pendingInjects.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {pendingInjects.map((inject) => {
                  const injectDate = new Date(inject.inject_date).getTime();
                  const remainingTime = injectDate - date;
                  const currentRemainingTime = injectDate - currentDate;
                  const percentRemaining = (currentRemainingTime * 100) / remainingTime;
                  return (
                    <ListItem
                      key={inject.inject_id}
                      dense={true}
                      classes={{ root: classes.item }}
                      divider={true}
                    >
                      <ListItemIcon>
                        <InjectIcon
                          type={inject.inject_type}
                          variant="inline"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <div>
                            <div
                              className={classes.bodyItem}
                              style={{ width: '50%' }}
                            >
                              {inject.inject_title}
                            </div>
                            <div
                              className={classes.bodyItem}
                              style={{ width: '25%', paddingTop: 8 }}
                            >
                              <LinearProgress
                                value={100 - percentRemaining}
                                variant="determinate"
                                style={{ width: '90%' }}
                              />
                            </div>
                            <div className={classes.bodyItem}>
                              <span className={classes.countdown}>
                                <Countdown
                                  date={inject.inject_date || Date.now()}
                                />
                              </span>
                            </div>
                          </div>
                        }
                      />
                      <ListItemSecondaryAction>
                        <InjectPopover
                          inject={inject}
                          exerciseId={exerciseId}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Empty message={t('No pending injects in this exercise.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="overline">{t('Processed injects')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {processedInjects.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {processedInjects.map((inject) => (
                  <ListItem
                    key={inject.inject_id}
                    dense={true}
                    classes={{ root: classes.item }}
                    divider={true}
                  >
                    <ListItemIcon>
                      <InjectIcon type={inject.inject_type} variant="inline" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '50%' }}
                          >
                            {inject.inject_title}
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '25%', paddingTop: 8 }}
                          >
                            <LinearProgress
                              value={80}
                              variant="determinate"
                              style={{ width: '90%' }}
                            />
                          </div>
                          <div className={classes.bodyItem}>
                            <span className={classes.countdown}>
                              <Countdown date={Date.now() + 500000} />
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No processed injects in this exercise.')} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Animation;
