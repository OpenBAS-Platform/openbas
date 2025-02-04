import { CastOutlined, CheckCircleOutlineOutlined, HistoryToggleOffOutlined, PersonOutlined } from '@mui/icons-material';
import { Grid, LinearProgress, linearProgressClasses, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { fetchComcheck, fetchComcheckStatuses } from '../../../../../actions/Comcheck';
import { fetchOrganizations } from '../../../../../actions/Organization';
import { fetchPlayers } from '../../../../../actions/User';
import { useFormatter } from '../../../../../components/i18n';
import ItemTags from '../../../../../components/ItemTags';
import SearchFilter from '../../../../../components/SearchFilter';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import useSearchAnFilter from '../../../../../utils/SortingFiltering';
import { progression } from '../../../../../utils/Time';
import TagsFilter from '../../../common/filters/TagsFilter';
import ComcheckState from './ComcheckState';
import ComcheckStatusState from './ComcheckStatusState';

const useStyles = makeStyles()(theme => ({
  parameters: {
    padding: '20px 15px 0 15px',
    float: 'left',
  },
  container: {
    marginTop: 10,
  },
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItem: {
    height: '100%',
    fontSize: 13,
  },
  icon: {
    position: 'absolute',
    top: 25,
    right: 15,
  },
  metric: {
    position: 'relative',
    padding: 20,
    height: '100%',
    overflow: 'hidden',
  },
  paper: {
    position: 'relative',
    padding: '20px 20px 0 20px',
    overflow: 'hidden',
    height: '100%',
  },
  paperList: {
    padding: '0 0 20px 0',
  },
  progress: {
    float: 'right',
    margin: '25px 90px 0 50px',
    flexGrow: 1,
  },
  title: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  user_email: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_organization: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_tags: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_status_sent_date: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_status_receive_date: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_status_state: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  user_email: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_organization: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_tags: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_status_sent_date: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_status_receive_date: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_status_state: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 4,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

const iconStatus = (status) => {
  switch (status) {
    case 'FINISHED':
      return (
        <CheckCircleOutlineOutlined color="primary" sx={{ fontSize: 50 }} />
      );
    case 'EXPIRED':
      return <HistoryToggleOffOutlined color="primary" sx={{ fontSize: 50 }} />;
    case 'RUNNING':
      return <CastOutlined color="primary" sx={{ fontSize: 50 }} />;
    default:
      return <CastOutlined color="primary" sx={{ fontSize: 50 }} />;
  }
};

const Comcheck = () => {
  // Standard hooks
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const intervalId = setInterval(() => setCurrentDate(new Date()), 5000);
    return () => clearInterval(intervalId);
  }, []);
  const { nsdt, fldt, t } = useFormatter();
  const { exerciseId, comcheckId } = useParams();
  // Filter and sort hook
  const searchColumns = [
    'email',
    'firstname',
    'lastname',
    'phone',
    'organization',
  ];
  const filtering = useSearchAnFilter('user', 'email', searchColumns);
  const { comcheck, statuses, usersMap } = useHelper((helper) => {
    return {
      comcheck: helper.getComcheck(comcheckId),
      statuses: helper.getComcheckStatuses(comcheckId),
      usersMap: helper.getUsersMap(),
    };
  });
  // Fetching data
  useDataLoader(() => {
    dispatch(fetchOrganizations());
    dispatch(fetchPlayers());
    dispatch(fetchComcheck(exerciseId, comcheckId));
    dispatch(fetchComcheckStatuses(exerciseId, comcheckId));
  });
  const players = statuses.map(s => ({
    ...(usersMap[s.comcheckstatus_user] || {}),
    user_status_state: s.comcheckstatus_state,
    user_status_sent_date: s.comcheckstatus_sent_date,
    user_status_receive_date: s.comcheckstatus_receive_date,
  }));
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3} style={{ marginTop: -14 }}>
        <Grid item={true} xs={6} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={4}>
                <Typography variant="h3">{t('Name')}</Typography>
                {comcheck?.comcheck_name}
              </Grid>
              <Grid item={true} xs={4}>
                <Typography variant="h3">{t('Start date')}</Typography>
                {fldt(comcheck?.comcheck_start_date)}
              </Grid>
              <Grid item={true} xs={4}>
                <Typography variant="h3">{t('End date')}</Typography>
                {fldt(comcheck?.comcheck_end_date)}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: -14 }}>
          <Paper
            variant="outlined"
            classes={{ root: classes.metric }}
            style={{ display: 'flex' }}
          >
            <div className={classes.icon}>
              {iconStatus(comcheck?.comcheck_state)}
            </div>
            <div>
              <div className={classes.title}>{t('Comcheck')}</div>
              <ComcheckState state={comcheck?.comcheck_state} />
            </div>
            <div className={classes.progress}>
              <BorderLinearProgress
                value={
                  comcheck?.comcheck_state === 'FINISHED'
                    ? 100
                    : progression(
                        currentDate,
                        Date.parse(comcheck?.comcheck_start_date),
                        Date.parse(comcheck?.comcheck_end_date),
                      )
                }
                variant="determinate"
              />
            </div>
          </Paper>
        </Grid>
      </Grid>
      <Paper
        variant="outlined"
        classes={{ root: classes.paperList }}
        style={{ marginTop: 30 }}
      >
        <div className={classes.parameters}>
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
        </div>
        <div className="clearfix" />
        <List classes={{ root: classes.container }}>
          <ListItem
            classes={{ root: classes.itemHead }}
            divider={false}
            style={{ paddingTop: 0 }}
          >
            <ListItemIcon>
              <span
                style={{
                  padding: '0 8px 0 8px',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                &nbsp;
              </span>
            </ListItemIcon>
            <ListItemText
              primary={(
                <div>
                  {filtering.buildHeader(
                    'user_email',
                    'Email address',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'user_organization',
                    'Organization',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'user_tags',
                    'Tags',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'user_status_sent_date',
                    'Sent date',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'user_status_receive_date',
                    'Received date',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'user_status_state',
                    'State',
                    true,
                    headerStyles,
                  )}
                </div>
              )}
            />
          </ListItem>
          {filtering.filterAndSort(players).map(user => (
            <ListItem
              key={user.user_id}
              classes={{ root: classes.item }}
              divider={true}
            >
              <ListItemIcon>
                <PersonOutlined color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={(
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.user_email}
                    >
                      {user.user_email}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.user_organization}
                    >
                      {user.organization?.organization_name || '-'}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.user_tags}
                    >
                      <ItemTags variant="list" tags={user.user_tags} />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.user_status_sent_date}
                    >
                      {nsdt(user.user_status_sent_date)}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.user_status_receive_date}
                    >
                      {nsdt(user.user_status_receive_date)}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.user_status_state}
                    >
                      <ComcheckStatusState
                        state={user.user_status_state}
                        variant="list"
                      />
                    </div>
                  </div>
                )}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default Comcheck;
