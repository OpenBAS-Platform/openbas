import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { interval } from 'rxjs';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import withStyles from '@mui/styles/withStyles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DescriptionOutlined } from '@mui/icons-material';
import { dateFormat, FIVE_SECONDS } from '../../../../utils/Time';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchLogs } from '../../../../actions/Log';
import { fetchGroups } from '../../../../actions/Group';
import { equalsSelector } from '../../../../utils/Selectors';
import LogsPopover from './LogsPopover';
import LogPopover from './LogPopover';
import LogView from './LogView';

const interval$ = interval(FIVE_SECONDS);

i18nRegister({
  fr: {
    'Exercise log': "Journal d'exercice",
    'You do not have any entries in the exercise log.':
      "Vous n'avez aucune entrée dans le journal de cet exercice.",
    'Outcome view': 'Vue du résultat',
    'Log view': "Vue de l'entrée",
  },
});

const styles = () => ({
  headtitle: {
    fontWeight: '600',
    fontSize: '18px',
  },
  headsubtitle: {
    fontSize: '15px',
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
    height: '35px',
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left',
  },
  log_title: {
    float: 'left',
    padding: '5px 0px 0px 0px',
  },
  log_date: {
    position: 'absolute',
    width: '140px',
    right: '45px',
    top: '26px',
    fontSize: '14px',
  },
  log_content: {
    padding: '0px 35px 0px 0px',
    textAlign: 'justify',
  },
});

class IndexExerciseLessons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openOutcome: false,
      openLog: false,
      currentLog: {},
    };
  }

  componentDidMount() {
    this.props.fetchGroups();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchLogs(this.props.exerciseId, true);
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleCloseOutcome() {
    this.setState({ openOutcome: false });
  }

  handleOpenLog(log) {
    this.setState({ currentLog: log, openLog: true });
  }

  handleCloseLog() {
    this.setState({ openLog: false });
  }

  render() {
    const { classes } = this.props;
    const userCanUpdate = this.props.exercise?.user_can_update;
    return (
      <div className={classes.container}>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              <T>Outcomes</T>
            </Typography>
            <div className="clearfix" style={{ marginBottom: 3 }} />
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              <T>Exercise log</T>
            </Typography>
            {userCanUpdate && (
              <LogsPopover exerciseId={this.props.exerciseId} />
            )}
            <div className="clearfix" />
            {this.props.logs.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any entries in the exercise log.</T>
              </div>
            )}
            <List>
              {this.props.logs.map((log) => (
                <ListItem
                  key={log.log_id}
                  onClick={this.handleOpenLog.bind(this, log)}
                  divider={true}
                  button={true}
                >
                  <ListItemIcon>
                    <DescriptionOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={log.log_title}
                    secondary={log.log_content}
                  />
                  <div className={classes.log_date}>
                    {dateFormat(log.log_date)}
                  </div>
                  <ListItemSecondaryAction>
                    <LogPopover exerciseId={this.props.exerciseId} log={log} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Dialog
              open={this.state.openLog}
              onClose={this.handleCloseLog.bind(this)}
              fullWidth={true}
              maxWidth="md"
            >
              <DialogTitle>
                <T>Log view</T>
              </DialogTitle>
              <DialogContent>
                <LogView log={this.state.currentLog} />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseLog.bind(this)}
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

IndexExerciseLessons.propTypes = {
  exerciseId: PropTypes.string,
  logs: PropTypes.array,
  fetchGroups: PropTypes.func,
  fetchLogs: PropTypes.func,
};

const filterLogs = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const { logs } = state.referential.entities;
  const logsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.log_exercise === exerciseId),
    R.sortWith([R.descend(R.prop('log_date'))]),
  );
  return logsFilterAndSorting(logs);
};

const exerciseStatusSelector = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  return R.path(
    [exerciseId, 'exercise_status'],
    state.referential.entities.exercises,
  );
};

const select = () => equalsSelector({
  // Prevent view to refresh is nothing as changed (Using reselect)
  exerciseId: (state, ownProps) => ownProps.id,
  exercise: (state, ownProps) => state.referential.entities.exercises[ownProps.id],
  logs: filterLogs,
  exercise_status: exerciseStatusSelector,
});

export default R.compose(
  connect(select, {
    fetchGroups,
    fetchLogs,
  }),
  withStyles(styles),
)(IndexExerciseLessons);
