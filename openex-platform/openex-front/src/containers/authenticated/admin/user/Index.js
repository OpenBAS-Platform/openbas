import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
/* eslint-disable */
import { fetchUsers } from "../../../../actions/User";
import { fetchOrganizations } from "../../../../actions/Organization";
import { List } from "../../../../components/List";
import {
  AvatarListItem,
  AvatarHeaderItem,
} from "../../../../components/list/ListItem";
import { Avatar } from "../../../../components/Avatar";
import { Icon } from "../../../../components/Icon";
import { SearchField } from "../../../../components/SimpleTextField";
import CreateUser from "./CreateUser";
import UserPopover from "./UserPopover";
/* eslint-enable */

i18nRegister({
  fr: {
    'Users management': 'Gestion des utilisateurs',
    Name: 'Nom',
    'Email address': 'Adresse email',
    Organization: 'Organisation',
    Administrator: 'Administrateur',
    Planner: 'Planificateur',
  },
});

const styles = {
  search: {
    float: 'right',
  },
  header: {
    avatar: {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '12px 0 0 15px',
    },
    user_firstname: {
      float: 'left',
      width: '20%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    user_email: {
      float: 'left',
      width: '30%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    user_organization: {
      float: 'left',
      width: '25%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    user_admin: {
      textAlign: 'center',
      float: 'left',
      width: '10%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    user_planificateur: {
      textAlign: 'center',
      float: 'left',
      width: '10%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
  },
  title: {
    float: 'left',
    fontSize: '20px',
    fontWeight: 600,
  },
  empty: {
    marginTop: 40,
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
    width: '20%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mail: {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  org: {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  admin: {
    float: 'left',
    textAlign: 'center',
    width: '10%',
    padding: '5px 0 0 0',
  },
  planificateur: {
    float: 'left',
    textAlign: 'center',
    width: '10%',
    padding: '5px 0 0 0',
  },
};

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = { sortBy: 'user_firstname', orderAsc: true, searchTerm: '' };
  }

  componentDidMount() {
    this.props.fetchUsers();
    this.props.fetchOrganizations();
  }

  handleSearchUsers(event) {
    this.setState({ searchTerm: event.target.value });
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

  // TODO replace with sortWith after Ramdajs new release
  // eslint-disable-next-line class-methods-use-this
  ascend(a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a < b ? -1 : a > b ? 1 : 0;
  }

  // eslint-disable-next-line class-methods-use-this
  descend(a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a > b ? -1 : a < b ? 1 : 0;
  }

  render() {
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;

    const users = R.pipe(
      R.values(),
      R.filter(filterByKeyword),
      R.sort((a, b) => {
        // TODO replace with sortWith after Ramdajs new release
        const fieldA = R.toLower(R.propOr('', this.state.sortBy, a).toString());
        const fieldB = R.toLower(R.propOr('', this.state.sortBy, b).toString());
        return this.state.orderAsc
          ? this.ascend(fieldA, fieldB)
          : this.descend(fieldA, fieldB);
      }),
    )(this.props.users);

    return (
      <div>
        <div style={styles.title}>
          <T>Users management</T>
        </div>
        <div style={styles.search}>
          <SearchField
            name="keyword"
            fullWidth={true}
            type="text"
            hintText="Search"
            onChange={this.handleSearchUsers.bind(this)}
            styletype={Constants.FIELD_TYPE_RIGHT}
          />
        </div>
        <div className="clearfix"></div>
        <List>
          <AvatarHeaderItem
            leftAvatar={<span style={styles.header.avatar}>#</span>}
            rightIconButton={<Icon style={{ display: 'none' }} />}
            primaryText={
              <div>
                {this.SortHeader('user_firstname', 'Name')}
                {this.SortHeader('user_email', 'Email address')}
                {this.SortHeader('user_organization', 'Organization')}
                {this.SortHeader('user_admin', 'Administrator')}
                {this.SortHeader('user_planificateur', 'Planner')}
                <div className="clearfix"></div>
              </div>
            }
          />

          {R.take(20, users).map((user) => {
            const userId = R.propOr(Math.random(), 'user_id', user);
            const userFirstname = R.propOr('-', 'user_firstname', user);
            const userLastname = R.propOr('-', 'user_lastname', user);
            const userEmail = R.propOr('-', 'user_email', user);
            const userGravatar = R.propOr('', 'user_gravatar', user);
            const userAdmin = R.propOr('-', 'user_admin', user);
            const userPlanificateur = R.propOr('-', 'user_planificateur', user);
            const userOrganization = R.propOr(
              {},
              user.user_organization,
              this.props.organizations,
            );
            const organizationName = R.propOr(
              '-',
              'organization_name',
              userOrganization,
            );

            return (
              <AvatarListItem
                key={userId}
                leftAvatar={
                  <Avatar
                    type={Constants.AVATAR_TYPE_MAINLIST}
                    src={userGravatar}
                  />
                }
                rightIconButton={<UserPopover user={user} />}
                primaryText={
                  <div>
                    <div style={styles.name}>
                      {userFirstname} {userLastname}
                    </div>
                    <div style={styles.mail}>{userEmail}</div>
                    <div style={styles.org}>{organizationName}</div>
                    <div style={styles.admin}>
                      {userAdmin ? (
                        <Icon name={Constants.ICON_NAME_ACTION_CHECK_CIRCLE} />
                      ) : (
                        <Icon
                          name={Constants.ICON_NAME_CONTENT_REMOVE_CIRCLE}
                        />
                      )}
                    </div>
                    <div style={styles.planificateur}>
                      {userPlanificateur ? (
                        <Icon name={Constants.ICON_NAME_ACTION_CHECK_CIRCLE} />
                      ) : (
                        <Icon
                          name={Constants.ICON_NAME_CONTENT_REMOVE_CIRCLE}
                        />
                      )}
                    </div>
                    <div className="clearfix" />
                  </div>
                }
              />
            );
          })}
        </List>
        <CreateUser />
      </div>
    );
  }
}

Index.propTypes = {
  users: PropTypes.object,
  organizations: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
};

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default connect(select, { fetchUsers, fetchOrganizations })(Index);
