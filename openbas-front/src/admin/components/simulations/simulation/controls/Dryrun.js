import { CastOutlined, CheckCircleOutlineOutlined, PersonOutlined } from '@mui/icons-material';
import { Chip, Grid, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { fetchDryinjects } from '../../../../../actions/Dryinject';
import { fetchDryrun } from '../../../../../actions/Dryrun';
import { fetchTags } from '../../../../../actions/Tag';
import { fetchPlayers } from '../../../../../actions/User';
import { useFormatter } from '../../../../../components/i18n';
import ItemStatus from '../../../../../components/ItemStatus';
import SearchFilter from '../../../../../components/SearchFilter';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import useSearchAnFilter from '../../../../../utils/SortingFiltering';
import { resolveUserName } from '../../../../../utils/String';
import InjectIcon from '../../../common/injects/InjectIcon';
import InjectorContract from '../../../common/injects/InjectorContract';
import InjectStatusDetails from '../../../common/injects/InjectStatusDetails';
import DryrunProgress from './DryrunProgress';
import DryrunStatus from './DryrunStatus';

const useStyles = makeStyles(theme => ({
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
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  date: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 4,
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

const Dryrun = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { nsdt, fldt, t, fndt, tPick } = useFormatter();
  const { exerciseId, dryrunId } = useParams();
  // Filter and sort hook
  const searchColumns = ['type', 'title', 'date'];
  const filtering = useSearchAnFilter('dryinject', 'date', searchColumns);
  // Fetching data
  const { dryrun, dryinjects, users } = useHelper((helper) => {
    return {
      dryrun: helper.getDryrun(dryrunId),
      dryinjects: helper.getDryrunInjects(dryrunId),
      users: helper.getDryrunUsers(dryrunId),
    };
  });
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchPlayers());
    dispatch(fetchDryrun(exerciseId, dryrunId));
    dispatch(fetchDryinjects(exerciseId, dryrunId));
  });
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3} style={{ marginTop: -14 }}>
        <Grid item={true} xs={6} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={4}>
                <Typography variant="h3">{t('Name')}</Typography>
                {dryrun?.dryrun_name}
              </Grid>
              <Grid item={true} xs={4}>
                <Typography variant="h3">{t('Start date')}</Typography>
                {fldt(dryrun?.dryrun_date)}
              </Grid>
              <Grid item={true} xs={4}>
                <Typography variant="h3" style={{ marginBottom: 0 }}>
                  {t('Dryrun recipients')}
                </Typography>
                <List>
                  {users.map(user => (
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
              <DryrunProgress
                start={dryrun?.dryrun_start_date}
                end={dryrun?.dryrun_end_date}
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
              )}
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {filtering.filterAndSort(dryinjects).map((dryinject) => {
            const injectContract = dryinject.inject_injector_contract.injector_contract_content_parsed;
            const injectorContractName = tPick(injectContract?.label);
            return (
              <ListItem
                key={dryinject.dryinject_id}
                classes={{ root: classes.item }}
                divider={true}
                disabled={!dryinject.dryinject_inject.inject_enabled}
              >
                <ListItemIcon style={{ paddingTop: 5 }}>
                  <InjectIcon type={dryinject.dryinject_inject.inject_type} disabled={!dryinject.dryinject_inject.inject_enabled} />
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.dryinject_type}
                      >
                        <InjectorContract
                          variant="list"
                          config={injectContract?.config}
                          label={injectorContractName}
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.dryinject_title}
                      >
                        {dryinject.dryinject_inject.inject_title}
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
                        <ItemStatus
                          variant="list"
                          status={dryinject.dryinject_status?.status_name}
                          label={t(dryinject.dryinject_status?.status_name)}
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
                        {fndt(dryinject.dryinject_status?.status_date)}
                        {' '}
                        (
                        {dryinject.dryinject_status
                        && (
                          dryinject.dryinject_status.status_execution / 1000
                        ).toFixed(2)}
                        {t('s')}
                        )
                      </div>
                    </div>
                  )}
                />
                <ListItemSecondaryAction>
                  <InjectStatusDetails status={dryinject.dryinject_status} />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </div>
  );
};

export default Dryrun;
