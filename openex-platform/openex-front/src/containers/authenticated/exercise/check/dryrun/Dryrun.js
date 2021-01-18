import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { interval } from 'rxjs';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {
  DoneAllOutlined,
  EmailOutlined,
  InputOutlined,
  SmsOutlined,
} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import { FIVE_SECONDS, timeDiff, dateFormat } from '../../../../../utils/Time';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import Theme from '../../../../../components/Theme';
import Countdown from '../../../../../components/Countdown';
import { fetchAudiences } from '../../../../../actions/Audience';
import { fetchDryrun } from '../../../../../actions/Dryrun';
import { fetchDryinjects } from '../../../../../actions/Dryinject';
import { downloadFile } from '../../../../../actions/File';
import DryrunPopover from './DryrunPopover';
import DryinjectView from './DryinjectView';
import DryinjectStatusView from './DryinjectStatusView';

const interval$ = interval(FIVE_SECONDS);

i18nRegister({
  fr: {
    Dryrun: 'Simulation',
    'You do not have any pending injects in this dryrun.':
      "Vous n'avez aucune injection en attente dans cette simulation.",
    'You do not have any processed injects in this dryrun.':
      "Vous n'avez aucune injection traitée dans cette simulation.",
    'Pending injects': 'Injections en attente',
    'Processed injects': 'Injections traitées',
    'Inject view': "Vue de l'injection",
    Status: 'Statut',
  },
});

const styles = () => ({
  container: {
    textAlign: 'center',
  },
  columnLeft: {
    float: 'left',
    width: '49%',
    margin: 0,
    padding: 0,
    textAlign: 'left',
  },
  columnRight: {
    float: 'right',
    width: '49%',
    margin: 0,
    padding: 0,
    textAlign: 'left',
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  audience: {
    float: 'right',
    fontSize: '15px',
    fontWeight: '600',
  },
  subtitle: {
    float: 'left',
    fontSize: '12px',
    color: '#848484',
  },
  state: {
    float: 'right',
  },
  empty: {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left',
  },
  dryinject_title: {
    float: 'left',
    padding: '5px 0 0 0',
  },
  dryinject_date: {
    float: 'right',
    padding: '5px 30px 0 0',
  },
});

class IndexExerciseDryrun extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openView: false,
      currentDryinject: {},
      openStatus: false,
      currentStatus: {},
    };
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
    this.subscription = interval$.subscribe(() => {
      this.props.fetchDryrun(this.props.exerciseId, this.props.dryrunId, true);
      this.props.fetchDryinjects(
        this.props.exerciseId,
        this.props.dryrunId,
        true,
      );
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  // eslint-disable-next-line class-methods-use-this
  selectIcon(type) {
    switch (type) {
      case 'openex_email':
        return <EmailOutlined />;
      case 'openex_ovh_sms':
        return <SmsOutlined />;
      case 'openex_manual':
        return <InputOutlined />;
      default:
        return <InputOutlined />;
    }
  }

  handleOpenView(dryinject) {
    this.setState({ currentDryinject: dryinject, openView: true });
  }

  handleCloseView() {
    this.setState({ openView: false });
  }

  handleOpenStatus(dryinject) {
    this.setState({ currentStatus: dryinject, openStatus: true });
  }

  handleCloseStatus() {
    this.setState({ openStatus: false });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  render() {
    const { classes } = this.props;
    const dryrunId = R.propOr('', 'dryrun_id', this.props.dryrun);
    const dryrunDate = R.propOr('', 'dryrun_date', this.props.dryrun);
    const dryrunFinished = R.propOr(
      false,
      'dryrun_finished',
      this.props.dryrun,
    );
    const nextDryinject = R.propOr(
      undefined,
      'dryinject_date',
      R.head(this.props.dryinjectsPending),
    );
    const countdown = nextDryinject && <Countdown targetDate={nextDryinject} />;
    const totalInjects = this.props.dryinjectsPending.length
      + this.props.dryinjectsProcessed.length;
    const processedInjects = this.props.dryinjectsProcessed.length;
    const percent = Math.round((processedInjects * 100) / totalInjects);
    return (
      <div className={classes.container}>
        <Typography variant="h5" style={{ float: 'left' }}>
          <T>Dryrun</T>
        </Typography>
        <DryrunPopover
          exerciseId={this.props.exerciseId}
          dryrun={this.props.dryrun}
          listenDeletionCall={this.cancelStreamEvent}
        />
        <div className={classes.audience}>{dryrunId}</div>
        <div className="clearfix" />
        <div className={classes.subtitle}>{dateFormat(dryrunDate)}</div>
        <div className={classes.state}>
          {dryrunFinished ? (
            <DoneAllOutlined style={{ color: Theme.palette.primary.main }} />
          ) : (
            <CircularProgress size={20} color="secondary" />
          )}
        </div>
        <div className="clearfix" />
        <br />
        <LinearProgress
          variant={
            this.props.dryinjectsProcessed.length === 0
              ? 'indeterminate'
              : 'determinate'
          }
          value={percent}
        />
        <br />
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <div className={classes.title}>
              <T>Pending injects</T> {countdown}
            </div>
            <div className="clearfix" />
            <List>
              {this.props.dryinjectsPending.length === 0 ? (
                <div className={classes.empty}>
                  <T>You do not have any pending injects in this dryrun.</T>
                </div>
              ) : (
                ''
              )}
              {R.take(30, this.props.dryinjectsPending).map((dryinject) => {
                const injectInProgress = R.path(['inject_status', 'status_name'], dryinject)
                  === 'PENDING';
                const injectIcon = injectInProgress ? (
                  <CircularProgress size={20} color="primary" />
                ) : (
                  this.selectIcon(dryinject.dryinject_type)
                );
                return (
                  <ListItem
                    key={dryinject.dryinject_id}
                    onClick={this.handleOpenView.bind(this, dryinject)}
                    button={true}
                    divider={true}
                  >
                    <ListItemIcon>{injectIcon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div className={classes.dryinject_title}>
                            {dryinject.dryinject_title}
                          </div>
                          <div className={classes.dryinject_date}>
                            {dateFormat(dryinject.dryinject_date)}
                          </div>
                          <div className="clearfix" />
                        </div>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
            <Dialog
              open={this.state.openView}
              onClose={this.handleCloseView.bind(this)}
            >
              <DialogTitle>
                {R.propOr('-', 'dryinject_title', this.state.currentDryinject)}
              </DialogTitle>
              <DialogContent>
                <DryinjectView
                  downloadAttachment={this.downloadAttachment.bind(this)}
                  dryinject={this.state.currentDryinject}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseView.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid item={true} xs={6}>
            <div className={classes.title}>
              <T>Processed injects</T>
            </div>
            <div className="clearfix" />
            <List>
              {this.props.dryinjectsProcessed.length === 0 ? (
                <div className={classes.empty}>
                  <T>You do not have any processed injects in this dryrun.</T>
                </div>
              ) : (
                ''
              )}
              {R.take(30, this.props.dryinjectsProcessed).map((dryinject) => {
                let color = '#4CAF50';
                if (dryinject.dryinject_status.status_name === 'ERROR') {
                  color = '#F44336';
                } else if (
                  dryinject.dryinject_status.status_name === 'PARTIAL'
                ) {
                  color = '#FF5722';
                }
                return (
                  <ListItem
                    key={dryinject.dryinject_id}
                    button={true}
                    divider={true}
                    onClick={this.handleOpenStatus.bind(this, dryinject)}
                  >
                    <ListItemIcon>
                      {this.selectIcon(dryinject.dryinject_type, color)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div className={classes.dryinject_title}>
                            {dryinject.dryinject_title}
                          </div>
                          <div className={classes.dryinject_date}>
                            {dateFormat(dryinject.dryinject_date)}
                          </div>
                          <div className="clearfix" />
                        </div>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
            <Dialog
              open={this.state.openStatus}
              onClose={this.handleCloseStatus.bind(this)}
            >
              <DialogTitle>
                <T>Status</T>
              </DialogTitle>
              <DialogContent>
                <DryinjectStatusView dryinject={this.state.currentStatus} />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseStatus.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </div>
    );
  }
}

IndexExerciseDryrun.propTypes = {
  exerciseId: PropTypes.string,
  dryrunId: PropTypes.string,
  audiences: PropTypes.array,
  dryrun: PropTypes.object,
  dryinjectsPending: PropTypes.array,
  dryinjectsProcessed: PropTypes.array,
  fetchAudiences: PropTypes.func,
  fetchDryinjects: PropTypes.func,
  fetchDryrun: PropTypes.func,
  downloadFile: PropTypes.func,
};

const filterAudiences = (audiences, exerciseId) => {
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  );
  return audiencesFilterAndSorting(audiences);
};

const filterDryinjectsPending = (dryinjects, dryrunId) => {
  const dryinjectsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => {
      const statusName = n.dryinject_status.status_name;
      const identifiedInject = n.dryinject_dryrun.dryrun_id === dryrunId;
      const isPendingInject = statusName === null || statusName === 'PENDING';
      return identifiedInject && isPendingInject;
    }),
    R.sort((a, b) => timeDiff(a.dryinject_date, b.dryinject_date)),
  );
  return dryinjectsFilterAndSorting(dryinjects);
};

const filterDryinjectsProcessed = (dryinjects, dryrunId) => {
  const dryinjectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(
      (n) => n.dryinject_dryrun.dryrun_id === dryrunId
        && (n.dryinject_status.status_name === 'SUCCESS'
          || n.dryinject_status.status_name === 'PARTIAL'
          || n.dryinject_status.status_name === 'ERROR'),
    ),
    R.sort((a, b) => timeDiff(b.dryinject_date, a.dryinject_date)),
  );
  return dryinjectsFilterAndSorting(dryinjects);
};

const select = (state, ownProps) => {
  const { id: exerciseId, dryrunId } = ownProps;
  const dryrun = R.propOr({}, dryrunId, state.referential.entities.dryruns);
  const audiences = filterAudiences(
    state.referential.entities.audiences,
    exerciseId,
  );
  const dryinjectsPending = filterDryinjectsPending(
    state.referential.entities.dryinjects,
    dryrunId,
  );
  const dryinjectsProcessed = filterDryinjectsProcessed(
    state.referential.entities.dryinjects,
    dryrunId,
  );

  return {
    exerciseId,
    dryrunId,
    dryrun,
    audiences,
    dryinjectsPending,
    dryinjectsProcessed,
  };
};

export default R.compose(
  connect(select, {
    fetchAudiences,
    fetchDryrun,
    fetchDryinjects,
    downloadFile,
  }),
  withStyles(styles),
)(IndexExerciseDryrun);
