import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { dateFormat } from '../../../../utils/Time';
import * as Constants from '../../../../constants/ComponentTypes';
import { List } from '../../../../components/List';
import { MainListItemLink } from '../../../../components/list/ListItem';
import { Icon } from '../../../../components/Icon';
import { fetchGroups } from '../../../../actions/Group';
import { fetchAudiences } from '../../../../actions/Audience';
import { fetchDryruns } from '../../../../actions/Dryrun';
import { fetchComchecks } from '../../../../actions/Comcheck';
import DryrunsPopover from './DryrunsPopover';
import ComchecksPopover from './ComchecksPopover';

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

const styles = {
  container: {
    textAlign: 'center',
  },
  columnLeft: {
    float: 'left',
    width: '48%',
    margin: 0,
    padding: 0,
    textAlign: 'left',
  },
  columnRight: {
    float: 'right',
    width: '48%',
    margin: 0,
    padding: 0,
    textAlign: 'left',
  },
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
};

class IndexExcerciseDryrun extends Component {
  componentDidMount() {
    this.props.fetchGroups();
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchDryruns(this.props.exerciseId);
    this.props.fetchComchecks(this.props.exerciseId);
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.columnLeft}>
          <div style={styles.title}>
            <T>Dryruns</T>
          </div>
          {this.props.userCanUpdate ? (
            <DryrunsPopover exerciseId={this.props.exerciseId} />
          ) : (
            ''
          )}
          <div className="clearfix"></div>
          {this.props.dryruns.length === 0 ? (
            <div style={styles.empty}>
              <T>You do not have any dryruns in this exercise.</T>
            </div>
          ) : (
            ''
          )}
          <List>
            {this.props.dryruns.map((dryrun) => (
              <MainListItemLink
                to={`/private/exercise/${this.props.exerciseId}/checks/dryrun/${dryrun.dryrun_id}`}
                key={dryrun.dryrun_id}
                primaryText={
                  <div>
                    <div style={styles.dryrun_audience}>
                      <T>Dryrun</T>
                    </div>
                    <div style={styles.dryrun_date}>
                      {dateFormat(dryrun.dryrun_date)}
                    </div>
                    <div className="clearfix"></div>
                  </div>
                }
                leftIcon={
                  <Icon
                    name={Constants.ICON_NAME_NOTIFICATION_ONDEMAND_VIDEO}
                    type={Constants.ICON_TYPE_MAINLIST}
                    color={dryrun.dryrun_finished ? '#666666' : '#E91E63'}
                  />
                }
              />
            ))}
          </List>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}>
            <T>Comchecks</T>
          </div>
          {this.props.userCanUpdate ? (
            <ComchecksPopover
              exerciseId={this.props.exerciseId}
              audiences={this.props.audiences}
            />
          ) : (
            ''
          )}
          <div className="clearfix"></div>
          {this.props.comchecks.length === 0 ? (
            <div style={styles.empty}>
              <T>You do not have any comchecks in this exercise.</T>
            </div>
          ) : (
            ''
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
                <MainListItemLink
                  to={`/private/exercise/${this.props.exerciseId}/checks/comcheck/${comcheck.comcheck_id}`}
                  key={comcheck.comcheck_id}
                  primaryText={
                    <div>
                      <div style={styles.dryrun_audience}>{audienceName}</div>
                      <div style={styles.dryrun_date}>
                        {dateFormat(comcheck.comcheck_start_date)}
                      </div>
                      <div className="clearfix" />
                    </div>
                  }
                  leftIcon={
                    <Icon
                      name={Constants.ICON_NAME_NOTIFICATION_NETWORK_CHECK}
                      type={Constants.ICON_TYPE_MAINLIST}
                      color={comcheck.comcheck_finished ? '#666666' : '#E91E63'}
                    />
                  }
                />
              );
            })}
          </List>
        </div>
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

export default connect(select, {
  fetchGroups,
  fetchAudiences,
  fetchDryruns,
  fetchComchecks,
})(IndexExcerciseDryrun);
