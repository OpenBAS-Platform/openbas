import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { interval } from 'rxjs';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import { DoneAllOutlined, CheckCircleOutlined } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { FIVE_SECONDS, dateFormat } from '../../../../../utils/Time';
import Theme from '../../../../../components/Theme';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import { fetchUsers } from '../../../../../actions/User';
import { fetchOrganizations } from '../../../../../actions/Organization';
import { fetchAudiences } from '../../../../../actions/Audience';
import {
  fetchComcheck,
  fetchComcheckStatuses,
} from '../../../../../actions/Comcheck';
import ComcheckPopover from './ComcheckPopover';

const interval$ = interval(FIVE_SECONDS);

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

const styles = () => ({
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
});

class Comcheck extends Component {
  constructor(props) {
    super(props);
    this.state = { sortBy: 'user_firstname', orderAsc: true };
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchUsers();
    this.props.fetchOrganizations();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchComcheck(
        this.props.exerciseId,
        this.props.comcheckId,
        true,
      );
      this.props.fetchComcheckStatuses(
        this.props.exerciseId,
        this.props.comcheckId,
        true,
      );
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  reverseBy(field) {
    this.setState({ sortBy: field, orderAsc: !this.state.orderAsc });
  }

  // eslint-disable-next-line class-methods-use-this
  ascend(a, b) {
    // replace with sortWith after Ramdajs new release
    // eslint-disable-next-line no-nested-ternary
    return a < b ? -1 : a > b ? 1 : 0;
  }

  // eslint-disable-next-line class-methods-use-this
  descend(a, b) {
    // replace with sortWith after Ramdajs new release
    // eslint-disable-next-line no-nested-ternary
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
    const userId = R.pathOr(Math.random(), ['status_user', 'user_id'], status);
    const user = R.propOr({}, userId, this.props.users);
    const userOrganization = R.propOr(
      {},
      user.user_organization,
      this.props.organizations,
    );
    return {
      user_firstname: R.propOr('-', 'user_firstname', user),
      user_lastname: R.propOr('-', 'user_lastname', user),
      user_email: R.propOr('-', 'user_email', user),
      user_gravatar: R.propOr('', 'user_gravatar', user),
      user_organization: R.propOr('-', 'organization_name', userOrganization),
      status_id: R.propOr(Math.random(), 'status_id', status),
      status_state: R.propOr(false, 'status_state', status),
      status_last_update: R.propOr('', 'status_last_update', status),
    };
  }

  render() {
    const { classes } = this.props;
    const data = R.pipe(
      R.map((status) => this.buildUserModel(status)),
      R.sort((a, b) => this.modelSorting(this.state.sortBy, this.state.orderAsc, a, b)),
    )(this.props.comcheck_statuses);
    const comcheckFinished = R.propOr(
      false,
      'comcheck_finished',
      this.props.comcheck,
    );
    return (
      <div>
        <div>
          <Typography variant="h5" style={{ float: 'left' }}>
            <T>Comcheck</T>
          </Typography>
          <ComcheckPopover
            exerciseId={this.props.exerciseId}
            comcheck={this.props.comcheck}
            listenDeletionCall={this.cancelStreamEvent}
          />
          <div className={classes.audience}>
            {R.propOr('-', 'audience_name', this.props.audience)}
          </div>
          <div className="clearfix" />
          <div className={classes.subtitle}>
            {dateFormat(
              R.propOr(undefined, 'comcheck_start_date', this.props.comcheck),
            )}
            &nbsp;&rarr;&nbsp;
            {dateFormat(
              R.propOr(undefined, 'comcheck_end_date', this.props.comcheck),
            )}
          </div>
          <div className={classes.comcheck_state}>
            {comcheckFinished ? (
              <DoneAllOutlined style={{ color: Theme.palette.primary.main }} />
            ) : (
              <CircularProgress size={20} color="secondary" />
            )}
          </div>
          <div className="clearfix" />
          <List>
            {data.map((item) => (
              <ListItem key={item.status_id} divider={true}>
                <ListItemAvatar>
                  <Avatar src={item.user_gravatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <div>
                      <div className={classes.name}>
                        {item.user_firstname} {item.user_lastname}
                      </div>
                      <div className={classes.mail}>{item.user_email}</div>
                      <div className={classes.org}>
                        {item.user_organization}
                      </div>
                      <div className={classes.update}>
                        {dateFormat(item.status_last_update)}
                      </div>
                      <div className={classes.state}>
                        <CheckCircleOutlined
                          style={{
                            color: item.status_state ? '#4CAF50' : '#F44336',
                          }}
                        />
                      </div>
                      <div className="clearfix" />
                    </div>
                  }
                />
              </ListItem>
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
  const { id: exerciseId, comcheckId } = ownProps;
  const comcheck = R.propOr(
    {},
    comcheckId,
    state.referential.entities.comchecks,
  );
  const audience = comcheck.comcheck_audience
    ? R.propOr(
      {},
      comcheck.comcheck_audience.audience_id,
      state.referential.entities.audiences,
    )
    : {};
  const comcheckStatuses = filterComcheckStatuses(
    state.referential.entities.comchecks_statuses,
    comcheckId,
  );
  return {
    exerciseId,
    comcheckId,
    audience,
    comcheck,
    comcheck_statuses: comcheckStatuses,
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  };
};

export default R.compose(
  connect(select, {
    fetchComcheck,
    fetchComcheckStatuses,
    fetchUsers,
    fetchAudiences,
    fetchOrganizations,
  }),
  withStyles(styles),
)(Comcheck);
