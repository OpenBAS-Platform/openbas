import React, { useEffect, useState } from 'react';
import { makeStyles, styled } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch } from 'react-redux';
import {
  PersonOutlined,
  CastOutlined,
  CheckCircleOutlineOutlined,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import SearchFilter from '../../../../components/SearchFilter';
import { fetchTags } from '../../../../actions/Tag';
import { fetchUsers } from '../../../../actions/User';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useStore } from '../../../../store';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { fetchDryrun } from '../../../../actions/Dryrun';
import { useFormatter } from '../../../../components/i18n';
import DryrunStatus from './DryrunStatus';
import { progression } from '../../../../utils/Time';
import { fetchDryinjects } from '../../../../actions/Dryinject';
import InjectIcon from '../injects/InjectIcon';
import InjectType from '../injects/InjectType';
import InjectStatus from '../injects/InjectStatus';
import InjectStatusDetails from '../injects/InjectStatusDetails';
import { resolveUserName } from '../../../../utils/String';

const useStyles = makeStyles((theme) => ({
  parameters: {
    padding: '20px 15px 0 15px',
    float: 'left',
  },
  container: {
    marginTop: 10,
  },
  itemHead: {
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    height: 50,
  },
  bodyItem: {
    height: '100%',
    fontSize: 13,
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
  inputLabel: {
    float: 'left',
  },
  sortIcon: {
    float: 'left',
    margin: '-5px 0 0 15px',
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
    padding: 20,
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
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 0,
    width: 180,
    backgroundColor: 'rgba(0, 177, 255, 0.08)',
    color: '#00b1ff',
    border: '1px solid #00b1ff',
  },
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  dryinject_type: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  dryinject_title: {
    float: 'left',
    width: '35%',
    fontSize: 12,
    fontWeight: '700',
  },
  dryinject_date: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  dryinject_status: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  dryinject_execution: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  dryinject_type: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dryinject_title: {
    float: 'left',
    width: '35%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dryinject_date: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dryinject_status: {
    float: 'left',
    height: 20,
    width: '10%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dryinject_execution: {
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
}));

const Dryrun = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const intervalId = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);
  const {
    nsdt, fldt, t, fndt,
  } = useFormatter();
  const { exerciseId, dryrunId } = useParams();
  // Filter and sort hook
  const searchColumns = ['type', 'title', 'date'];
  const filtering = useSearchAnFilter('dryinject', 'date', searchColumns);
  // Fetching data
  const dryrun = useStore((store) => store.getDryrun(dryrunId));
  const dryinjects = dryrun ? dryrun.dryinjects : [];
  const users = dryrun ? dryrun.users : [];
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchUsers());
    dispatch(fetchDryrun(exerciseId, dryrunId));
    dispatch(fetchDryinjects(exerciseId, dryrunId));
  });
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3} style={{ marginTop: -14 }}>
        <Grid item={true} xs={6} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Typography variant="h1">{t('Start date')}</Typography>
                {fldt(dryrun?.dryrun_date)}
                <Typography variant="h1" style={{ marginTop: 20 }}>
                  {t('Speed')}
                </Typography>
                <code>{dryrun?.dryrun_speed}x</code>
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h1" style={{ marginBottom: 0 }}>
                  {t('Dryrun recipients')}
                </Typography>
                <List>
                  {users.map((user) => (
                    <ListItem
                      key={user.user_id}
                      divider={true}
                      dense={true}
                      style={{ paddingLeft: 0 }}
                    >
                      <ListItemIcon>
                        <PersonOutlined />
                      </ListItemIcon>
                      <ListItemText primary={resolveUserName(user)} />
                    </ListItem>
                  ))}
                </List>
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
              {dryrun?.dryrun_finished ? (
                <CheckCircleOutlineOutlined
                  color="primary"
                  sx={{ fontSize: 50 }}
                />
              ) : (
                <CastOutlined color="primary" sx={{ fontSize: 50 }} />
              )}
            </div>
            <div>
              <div className={classes.title}>{t('Dryrun')}</div>
              <DryrunStatus finished={dryrun?.dryrun_finished} />
            </div>
            <div className={classes.progress}>
              <BorderLinearProgress
                value={progression(
                  currentDate,
                  Date.parse(dryrun?.dryrun_start_date),
                  Date.parse(dryrun?.dryrun_end_date),
                )}
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
          <div style={{ float: 'left', marginRight: 20 }}>
            <SearchFilter
              small={true}
              onChange={filtering.handleSearch}
              keyword={filtering.keyword}
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
                  padding: '0 8px 0 10px',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                #
              </span>
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  {filtering.buildHeader(
                    'dryinject_type',
                    'Type',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'dryinject_title',
                    'Title',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'dryinject_date',
                    'Date',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'dryinject_status',
                    'Status',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'dryinject_execution',
                    'Execution',
                    false,
                    headerStyles,
                  )}
                </div>
              }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {filtering.filterAndSort(dryinjects).map((dryinject) => (
            <ListItem
              key={dryinject.dryinject_id}
              classes={{ root: classes.item }}
              divider={true}
            >
              <ListItemIcon>
                <InjectIcon type={dryinject.dryinject_type} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.dryinject_type}
                    >
                      <InjectType
                        variant="list"
                        type={dryinject.dryinject_type}
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.dryinject_title}
                    >
                      {dryinject.dryinject_title}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.dryinject_date}
                    >
                      <Chip
                        classes={{ root: classes.date }}
                        label={nsdt(dryinject.dryinject_date)}
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.dryinject_status}
                    >
                      <InjectStatus
                        variant="list"
                        status={dryinject.dryinject_status?.status_name}
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={{
                        fontFamily: 'Consolas, monaco, monospace',
                        fontSize: 12,
                        paddingTop: 3,
                        marginRight: 15,
                        float: 'left',
                      }}
                    >
                      {fndt(dryinject.dryinject_status?.status_date)} (
                      {dryinject.dryinject_status
                        && (
                          dryinject.dryinject_status.status_execution / 1000
                        ).toFixed(2)}
                      s)
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <InjectStatusDetails status={dryinject.dryinject_status} />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default Dryrun;
