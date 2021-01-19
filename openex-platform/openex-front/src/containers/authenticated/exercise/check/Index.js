import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {
  OndemandVideoOutlined,
  NetworkCheckOutlined,
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { dateFormat } from '../../../../utils/Time';
import { fetchGroups } from '../../../../actions/Group';
import { fetchAudiences } from '../../../../actions/Audience';
import { fetchDryruns } from '../../../../actions/Dryrun';
import { fetchComchecks } from '../../../../actions/Comcheck';
import DryrunsPopover from './dryrun/DryrunsPopover';
import ComchecksPopover from './comcheck/ComchecksPopover';

i18nRegister({
  fr: {
    Dryruns: 'Simulations',
    Comchecks: 'Tests de communication',
    'You do not have any dryruns in this exercise.':
      "Vous n'avez aucune simulation dans cet exercice.",
    'You do not have any comchecks in this exercise.':
      "Vous n'avez aucun test de communication dans cet exercice.",
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
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left',
  },
  dryrun_audience: {
    float: 'left',
    padding: '5px 0 0 0',
  },
  dryrun_status: {
    float: 'left',
    padding: '5px 0 0 0',
  },
  dryrun_date: {
    float: 'right',
    width: '130px',
    padding: '5px 0 0 0',
  },
});

class IndexExcerciseDryrun extends Component {
  componentDidMount() {
    this.props.fetchGroups();
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchDryruns(this.props.exerciseId);
    this.props.fetchComchecks(this.props.exerciseId);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              <T>Dryruns</T>
            </Typography>
            {this.props.userCanUpdate && (
              <DryrunsPopover exerciseId={this.props.exerciseId} />
            )}
            <div className="clearfix" />
            {this.props.dryruns.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any dryruns in this exercise.</T>
              </div>
            )}
            <List>
              {this.props.dryruns.map((dryrun) => (
                <ListItem
                  key={dryrun.dryrun_id}
                  component={Link}
                  button={true}
                  divider={true}
                  to={`/private/exercise/${this.props.exerciseId}/checks/dryrun/${dryrun.dryrun_id}`}
                >
                  <ListItemIcon
                    style={{
                      color: dryrun.dryrun_finished ? '#666666' : '#E91E63',
                    }}
                  >
                    <OndemandVideoOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <div>
                        <div className={classes.dryrun_audience}>
                          <T>Dryrun</T>
                        </div>
                        <div className={classes.dryrun_date}>
                          {dateFormat(dryrun.dryrun_date)}
                        </div>
                        <div className="clearfix" />
                      </div>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              <T>Comchecks</T>
            </Typography>
            {this.props.userCanUpdate && (
              <ComchecksPopover
                exerciseId={this.props.exerciseId}
                audiences={this.props.audiences}
              />
            )}
            <div className="clearfix" />
            {this.props.comchecks.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any comchecks in this exercise.</T>
              </div>
            )}
            <List>
              {this.props.comchecks.map((comcheck) => {
                const comcheckAudience = R.find(
                  (a) => a.audience_id === comcheck.comcheck_audience.audience_id,
                  this.props.audiences,
                );
                const audienceName = R.propOr(
                  '-',
                  'audience_name',
                  comcheckAudience,
                );
                return (
                  <ListItem
                    key={comcheck.comcheck_id}
                    component={Link}
                    button={true}
                    divider={true}
                    to={`/private/exercise/${this.props.exerciseId}/checks/comcheck/${comcheck.comcheck_id}`}
                  >
                    <ListItemIcon
                      style={{
                        color: comcheck.comcheck_finished
                          ? '#666666'
                          : '#E91E63',
                      }}
                    >
                      <NetworkCheckOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div className={classes.dryrun_audience}>
                            {audienceName}
                          </div>
                          <div className={classes.dryrun_date}>
                            {dateFormat(comcheck.comcheck_start_date)}
                          </div>
                          <div className="clearfix" />
                        </div>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Grid>
        </Grid>
      </div>
    );
  }
}

IndexExcerciseDryrun.propTypes = {
  exerciseId: PropTypes.string,
  userCanUpdate: PropTypes.bool,
  audiences: PropTypes.array,
  dryruns: PropTypes.array,
  comchecks: PropTypes.array,
  fetchGroups: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchDryruns: PropTypes.func,
  fetchComchecks: PropTypes.func,
};

const filterDryruns = (dryruns, exerciseId) => {
  const dryrunsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.dryrun_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.dryrun_date < b.dryrun_date),
  );
  return dryrunsFilterAndSorting(dryruns);
};

const filterComchecks = (comchecks, exerciseId) => {
  const comchecksFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.comcheck_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.comcheck_start_date < b.comcheck_start_date),
  );
  return comchecksFilterAndSorting(comchecks);
};

const filterAudiences = (audiences, exerciseId) => {
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  );
  return audiencesFilterAndSorting(audiences);
};

const checkUserCanUpdate = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const userId = R.path(['logged', 'user'], state.app);
  let userCanUpdate = R.path(
    [userId, 'user_admin'],
    state.referential.entities.users,
  );
  if (!userCanUpdate) {
    const groupValues = R.values(state.referential.entities.groups);
    groupValues.forEach((group) => {
      group.group_grants.forEach((grant) => {
        if (
          grant
          && grant.grant_exercise
          && grant.grant_exercise.exercise_id === exerciseId
          && grant.grant_name === 'PLANNER'
        ) {
          group.group_users.forEach((user) => {
            if (user && user.user_id === userId) {
              userCanUpdate = true;
            }
          });
        }
      });
    });
  }

  return userCanUpdate;
};

const select = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const dryruns = filterDryruns(state.referential.entities.dryruns, exerciseId);
  const comchecks = filterComchecks(
    state.referential.entities.comchecks,
    exerciseId,
  );
  const audiences = filterAudiences(
    state.referential.entities.audiences,
    exerciseId,
  );
  const userCanUpdate = checkUserCanUpdate(state, ownProps);
  return {
    exerciseId,
    userCanUpdate,
    audiences,
    dryruns,
    comchecks,
  };
};

export default R.compose(
  connect(select, {
    fetchGroups,
    fetchAudiences,
    fetchDryruns,
    fetchComchecks,
  }),
  withStyles(styles),
)(IndexExcerciseDryrun);
