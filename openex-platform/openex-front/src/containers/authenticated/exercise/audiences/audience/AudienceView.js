import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import * as Constants from '../../../../../constants/ComponentTypes';
/* eslint-disable */
import { fetchUsers } from "../../../../../actions/User";
import { fetchOrganizations } from "../../../../../actions/Organization";
/* eslint-enable */
import {
  MainSmallListItem,
  SecondarySmallListItem,
} from '../../../../../components/list/ListItem';
import { List } from '../../../../../components/List';
import { Avatar } from '../../../../../components/Avatar';
import { Icon } from '../../../../../components/Icon';
import Theme from '../../../../../components/Theme';

const styles = {
  container: {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px',
  },
  story: {},
};

class AudienceView extends Component {
  componentDidMount() {
    this.props.fetchUsers();
    this.props.fetchOrganizations();
  }

  render() {
    const filterSubaudiences = (subaudiences, audienceId) => {
      const subaudiencesFilterAndSorting = R.pipe(
        R.values,
        R.filter((n) => n.subaudience_audience.audience_id === audienceId),
        R.sort((a, b) => a.subaudience_name.localeCompare(b.subaudience_name)),
      );
      return subaudiencesFilterAndSorting(subaudiences);
    };

    let subaudiences = [];
    if (this.props.audience) {
      subaudiences = filterSubaudiences(
        this.props.subaudiences,
        this.props.audience.audience_id,
      );
    }

    return (
      <div style={styles.container}>
        <List>
          {subaudiences.map((subaudience) => {
            const nestedItems = subaudience.subaudience_users.map((data) => {
              const user = R.propOr({}, data.user_id, this.props.users);
              const userId = R.propOr(data.user_id, 'user_id', user);
              const userFirstname = R.propOr('-', 'user_firstname', user);
              const userLastname = R.propOr('-', 'user_lastname', user);
              const userGravatar = R.propOr('', 'user_gravatar', user);
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
                <SecondarySmallListItem
                  key={userId}
                  leftAvatar={
                    <Avatar
                      type={Constants.AVATAR_TYPE_MAINLIST}
                      src={userGravatar}
                    />
                  }
                  primaryText={
                    <div>
                      {userFirstname} {userLastname}
                    </div>
                  }
                  secondaryText={organizationName}
                />
              );
            });

            return (
              <MainSmallListItem
                initiallyOpen={true}
                key={subaudience.subaudience_id}
                leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} />}
                primaryText={subaudience.subaudience_name}
                nestedItems={nestedItems}
              />
            );
          })}
        </List>
      </div>
    );
  }
}

AudienceView.propTypes = {
  audience: PropTypes.object,
  subaudiences: PropTypes.object,
  organizations: PropTypes.array,
  users: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
};

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default connect(select, {
  fetchUsers,
  fetchOrganizations,
})(AudienceView);
