import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Theme from '../../../../components/Theme';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
/* eslint-disable */
import { fetchAudiences } from "../../../../actions/Audience";
import { fetchGroups } from "../../../../actions/Group";
import { SearchField } from "../../../../components/SimpleTextField";
import { Icon } from "../../../../components/Icon";
import { List } from "../../../../components/List";
import { MainListItemLink } from "../../../../components/list/ListItem";
import CreateAudience from "./audience/CreateAudience";
/* eslint-enable */

const styles = {
  container: {
    textAlign: 'left',
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  search: {
    float: 'right',
  },
};

i18nRegister({
  fr: {
    Audiences: 'Audiences',
    'You do not have any audiences in this exercise.':
      "Vous n'avez aucune audience dans cet exercice.",
    players: 'joueurs',
  },
});

class IndexAudiences extends Component {
  constructor(props) {
    super(props);
    this.state = { searchTerm: '' };
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchGroups();
  }

  handleSearchAudiences(event, value) {
    this.setState({ searchTerm: value });
  }

  // eslint-disable-next-line class-methods-use-this
  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor;
    }
    return Theme.palette.textColor;
  }

  render() {
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.audience_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const filteredAudiences = R.filter(filterByKeyword, this.props.audiences);

    return (
      <div style={styles.container}>
        <div style={styles.title}>
          <T>Audiences</T>
        </div>
        <div style={styles.search}>
          <SearchField
            name="keyword"
            fullWidth={true}
            type="text"
            hintText="Search"
            onChange={this.handleSearchAudiences.bind(this)}
            styletype={Constants.FIELD_TYPE_RIGHT}
          />
        </div>
        <div className="clearfix" />
        {this.props.audiences.length === 0 ? (
          <div style={styles.empty}>
            <T>You do not have any audiences in this exercise.</T>
          </div>
        ) : (
          ''
        )}
        <List>
          {filteredAudiences.map((audience) => (
            <MainListItemLink
              to={`/private/exercise/${this.props.exerciseId}/audiences/${audience.audience_id}`}
              key={audience.audience_id}
              leftIcon={
                <Icon
                  name={Constants.ICON_NAME_SOCIAL_GROUP}
                  color={this.switchColor(!audience.audience_enabled)}
                />
              }
              primaryText={
                <div
                  style={{
                    color: this.switchColor(!audience.audience_enabled),
                  }}
                >
                  {audience.audience_name}
                </div>
              }
              secondaryText={
                <div
                  style={{
                    color: this.switchColor(!audience.audience_enabled),
                  }}
                >
                  {audience.audience_users_number}&nbsp;
                  <T>players</T>
                </div>
              }
              rightIcon={
                <Icon
                  name={Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_RIGHT}
                  color={this.switchColor(!audience.audience_enabled)}
                />
              }
            />
          ))}
        </List>

        {this.props.userCanUpdate ? (
          <CreateAudience exerciseId={this.props.exerciseId} />
        ) : (
          ''
        )}
      </div>
    );
  }
}

IndexAudiences.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  fetchGroups: PropTypes.func,
  fetchAudiences: PropTypes.func.isRequired,
  userCanUpdate: PropTypes.bool,
};

const filteredAudiences = (audiences, exerciseId) => {
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  );
  return audiencesFilterAndSorting(audiences);
};

const checkUserCanUpdate = (state, ownProps) => {
  const { exerciseId } = ownProps.params;
  const userId = R.path(['logged', 'user'], state.app);
  const isAdmin = R.path(
    [userId, 'user_admin'],
    state.referential.entities.users,
  );

  let userCanUpdate = isAdmin;
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
  const { exerciseId } = ownProps.params;
  const audiences = filteredAudiences(
    state.referential.entities.audiences,
    exerciseId,
  );
  const userCanUpdate = checkUserCanUpdate(state, ownProps);

  return {
    exerciseId,
    audiences,
    userCanUpdate,
  };
};

export default connect(select, {
  fetchAudiences,
  fetchGroups,
})(IndexAudiences);
