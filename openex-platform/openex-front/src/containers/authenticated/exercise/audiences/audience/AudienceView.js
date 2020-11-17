import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import * as Constants from '../../../../../constants/ComponentTypes';
import { fetchUsers } from '../../../../../actions/User';
import { fetchOrganizations } from '../../../../../actions/Organization';
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
              const user_id = R.propOr(data.user_id, 'user_id', user);
              const user_firstname = R.propOr('-', 'user_firstname', user);
              const user_lastname = R.propOr('-', 'user_lastname', user);
              const user_gravatar = R.propOr('', 'user_gravatar', user);
              const user_organization = R.propOr(
                {},
                user.user_organization,
                this.props.organizations,
              );
              const organizationName = R.propOr(
                '-',
                'organization_name',
                user_organization,
              );

              return (
                <SecondarySmallListItem
                  key={user_id}
                  leftAvatar={
                    <Avatar
                      type={Constants.AVATAR_TYPE_MAINLIST}
                      src={user_gravatar}
                    />
                  }
                  primaryText={
                    <div>
                      {user_firstname} {user_lastname}
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
