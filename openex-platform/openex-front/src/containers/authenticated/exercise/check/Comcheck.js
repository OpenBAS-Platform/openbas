import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Observable } from 'rxjs';
import { FIVE_SECONDS, dateFormat } from '../../../../utils/Time';
import Theme from '../../../../components/Theme';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { fetchUsers } from '../../../../actions/User';
import { fetchOrganizations } from '../../../../actions/Organization';
import { fetchAudiences } from '../../../../actions/Audience';
import {
  fetchComcheck,
  fetchComcheckStatuses,
} from '../../../../actions/Comcheck';
import { List } from '../../../../components/List';
import {
  AvatarListItem,
  AvatarHeaderItem,
} from '../../../../components/list/ListItem';
import { Avatar } from '../../../../components/Avatar';
import { CircularSpinner } from '../../../../components/Spinner';
import { Icon } from '../../../../components/Icon';

import ComcheckPopover from './ComcheckPopover';

i18nRegister({
  fr: {
    Comcheck: 'Test de communication',
    Name: 'Nom',
    'Email address': 'Adresse email',
    Organization: 'Organisation',
    'Last update': 'Mise à jour',
    State: 'Statut',
  },
});

const styles = {
  header: {
    avatar: {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '12px 0 0 15px',
    },
    user_firstname: {
      float: 'left',
      width: '22%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    user_email: {
      float: 'left',
      width: '35%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    user_organization: {
      float: 'left',
      width: '22%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    status_last_update: {
      float: 'left',
      width: '15%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    status_state: {
      float: 'right',
      width: '6%',
      fontSize: '12px',
      textTransform: 'uppercase',
      textAlign: 'center',
      fontWeight: '700',
    },
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
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
  number: {
    float: 'right',
    color: '#9E9E9E',
    fontSize: '12px',
  },
  name: {
    float: 'left',
    width: '22%',
    padding: '5px 0 0 0',
  },
  mail: {
    float: 'left',
    width: '35%',
    padding: '5px 0 0 0',
  },
  org: {
    float: 'left',
    width: '22%',
    padding: '5px 0 0 0',
  },
  update: {
    float: 'left',
    width: '15%',
    padding: '5px 0 0 0',
  },
  state: {
    float: 'right',
    width: '6%',
    textAlign: 'center',
    padding: 0,
  },
  comcheck_state: {
    float: 'right',
  },
};

class Comcheck extends Component {
  constructor(props) {
    super(props);
    this.state = { sortBy: 'user_firstname', orderAsc: true };
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchUsers();
    this.props.fetchOrganizations();
    // Scheduler listener
    const initialStream = Observable.of(1); // Fetch on loading
    const intervalStream = Observable.interval(FIVE_SECONDS); // Fetch every five seconds
    const cancelStream = Observable.create((obs) => {
      this.cancelStreamEvent = () => {
        obs.next(1);
      };
    });
    this.subscription = initialStream
      .merge(intervalStream)
      .takeUntil(cancelStream)
      .exhaustMap(() => Promise.all([
        this.props.fetchComcheck(
          this.props.exerciseId,
          this.props.comcheckId,
          true,
        ),
        this.props.fetchComcheckStatuses(
          this.props.exerciseId,
          this.props.comcheckId,
          true,
        ),
      ]))
      .subscribe();
  }

  componentWillReceiveProps(nextProps) {
    const comcheck_finished = R.propOr(
      false,
      'comcheck_finished',
      nextProps.comcheck,
    );
    if (comcheck_finished) this.cancelStreamEvent();
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  reverseBy(field) {
    this.setState({ sortBy: field, orderAsc: !this.state.orderAsc });
  }

  SortHeader(field, label) {
    const icon = this.state.orderAsc
      ? Constants.ICON_NAME_NAVIGATION_ARROW_DROP_DOWN
      : Constants.ICON_NAME_NAVIGATION_ARROW_DROP_UP;
    const IconDisplay = this.state.sortBy === field ? (
        <Icon type={Constants.ICON_TYPE_SORT} name={icon} />
    ) : (
      ''
    );
    return (
      <div
        style={styles.header[field]}
        onClick={this.reverseBy.bind(this, field)}
      >
        <T>{label}</T> {IconDisplay}
      </div>
    );
  }

  // TODO MOVE THAT TO UTILS
  ascend(a, b) {
    // replace with sortWith after Ramdajs new release
    return a < b ? -1 : a > b ? 1 : 0;
  }

  descend(a, b) {
    // replace with sortWith after Ramdajs new release
    return a > b ? -1 : a < b ? 1 : 0;
  }

  modelSorting(criteria, ascending, a, b) {
    // TODO Add real type support for instant, boolean, ...
    const fieldA = R.compose(R.toLower, R.toString, R.propOr('', criteria))(a);
    const fieldB = R.compose(R.toLower, R.toString, R.propOr('', criteria))(b);
    return ascending
      ? this.ascend(fieldA, fieldB)
      : this.descend(fieldA, fieldB);
  }

  // TODO MOVE THAT TO UTILS

  buildUserModel(status) {
    const user_id = R.pathOr(Math.random(), ['status_user', 'user_id'], status);
    const user = R.propOr({}, user_id, this.props.users);
    const user_organization = R.propOr(
      {},
      user.user_organization,
      this.props.organizations,
    );
    return {
      user_firstname: R.propOr('-', 'user_firstname', user),
      user_lastname: R.propOr('-', 'user_lastname', user),
      user_email: R.propOr('-', 'user_email', user),
      user_gravatar: R.propOr('', 'user_gravatar', user),
      user_organization: R.propOr('-', 'organization_name', user_organization),
      status_id: R.propOr(Math.random(), 'status_id', status),
      status_state: R.propOr(false, 'status_state', status),
      status_last_update: R.propOr('', 'status_last_update', status),
    };
  }

  render() {
    const data = R.pipe(
      R.map((status) => this.buildUserModel(status)),
      R.sort((a, b) => this.modelSorting(this.state.sortBy, this.state.orderAsc, a, b)),
    )(this.props.comcheck_statuses);

    const comcheck_finished = R.propOr(
      false,
      'comcheck_finished',
      this.props.comcheck,
    );

    return (
      <div>
        <div>
          <div style={styles.title}>
            <T>Comcheck</T>
          </div>
          <ComcheckPopover
            exerciseId={this.props.exerciseId}
            comcheck={this.props.comcheck}
            listenDeletionCall={this.cancelStreamEvent}
          />
          <div style={styles.audience}>
            {R.propOr('-', 'audience_name', this.props.audience)}
          </div>
          <div className="clearfix"></div>
          <div style={styles.subtitle}>
            {dateFormat(
              R.propOr(undefined, 'comcheck_start_date', this.props.comcheck),
            )}
            &nbsp;&rarr;&nbsp;
            {dateFormat(
              R.propOr(undefined, 'comcheck_end_date', this.props.comcheck),
            )}
          </div>
          <div style={styles.comcheck_state}>
            {comcheck_finished ? (
              <Icon
                name={Constants.ICON_NAME_ACTION_DONE_ALL}
                color={Theme.palette.primary1Color}
              />
            ) : (
              <CircularSpinner size={20} color={Theme.palette.primary1Color} />
            )}
          </div>
          <div className="clearfix"></div>
          <List>
            <AvatarHeaderItem
              leftAvatar={<span style={styles.header.avatar}>#</span>}
              primaryText={
                <div>
                  {this.SortHeader('user_firstname', 'Name')}
                  {this.SortHeader('user_email', 'Email address')}
                  {this.SortHeader('user_organization', 'Organization')}
                  {this.SortHeader('status_last_update', 'Last update')}
                  {this.SortHeader('status_state', 'State')}
                  <div className="clearfix"></div>
                </div>
              }
            />

            {data.map((item) =>
              // Return the dom
              (
                <AvatarListItem
                  key={item.status_id}
                  leftAvatar={
                    <Avatar
                      type={Constants.AVATAR_TYPE_MAINLIST}
                      src={item.user_gravatar}
                    />
                  }
                  primaryText={
                    <div>
                      <div style={styles.name}>
                        {item.user_firstname} {item.user_lastname}
                      </div>
                      <div style={styles.mail}>{item.user_email}</div>
                      <div style={styles.org}>{item.user_organization}</div>
                      <div style={styles.update}>
                        {dateFormat(item.status_last_update)}
                      </div>
                      <div style={styles.state}>
                        <Icon
                          name={Constants.ICON_NAME_ACTION_CHECK_CIRCLE}
                          color={item.status_state ? '#4CAF50' : '#F44336'}
                        />
                      </div>
                      <div className="clearfix"></div>
                    </div>
                  }
                />
              ))}
          </List>
        </div>
      </div>
    );
  }
}

Comcheck.propTypes = {
  exerciseId: PropTypes.string,
  comcheckId: PropTypes.string,
  audience: PropTypes.object,
  comcheck: PropTypes.object,
  comcheck_statuses: PropTypes.array,
  users: PropTypes.object,
  organizations: PropTypes.object,
  fetchComcheck: PropTypes.func,
  fetchComcheckStatuses: PropTypes.func,
  fetchUsers: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchOrganizations: PropTypes.func,
};

const filterComcheckStatuses = (statuses, comcheckId) => {
  const statusesFilter = R.pipe(
    R.values,
    R.filter((n) => n.status_comcheck.comcheck_id === comcheckId),
  );
  return statusesFilter(statuses);
};

const select = (state, ownProps) => {
  const { exerciseId } = ownProps.params;
  const { comcheckId } = ownProps.params;
  const comcheck = R.propOr({}, comcheckId, state.referential.entities.comchecks);
  const audience = comcheck.comcheck_audience
    ? R.propOr(
      {},
      comcheck.comcheck_audience.audience_id,
      state.referential.entities.audiences,
    )
    : {};
  const comcheck_statuses = filterComcheckStatuses(
    state.referential.entities.comchecks_statuses,
    comcheckId,
  );

  return {
    exerciseId,
    comcheckId,
    audience,
    comcheck,
    comcheck_statuses,
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  };
};

export default connect(select, {
  fetchComcheck,
  fetchComcheckStatuses,
  fetchUsers,
  fetchAudiences,
  fetchOrganizations,
})(Comcheck);
