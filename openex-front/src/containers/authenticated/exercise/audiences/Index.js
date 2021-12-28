import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { green, red } from '@mui/material/colors';
import withStyles from '@mui/styles/withStyles';
import { GroupOutlined, KeyboardArrowRightOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchAudiences } from '../../../../actions/Audience';
import { fetchGroups } from '../../../../actions/Group';
import { SearchField } from '../../../../components/SearchField';
import CreateAudience from './audience/CreateAudience';

const styles = () => ({
  search: {
    float: 'right',
  },
  enabled: {
    color: green[500],
  },
  disabled: {
    color: red[500],
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
});

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

  handleSearchAudiences(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    const { classes, audiences } = this.props;
    const { searchTerm } = this.state;
    const userCanUpdate = this.props.exercise?.user_can_update;
    const filterByKeyword = (n) => searchTerm === ''
      || n.audience_name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
    const filteredAudiences = R.filter(filterByKeyword, audiences);
    return (
      <div className={classes.container}>
        <div>
          <Typography variant="h5" style={{ float: 'left' }}>
            <T>Audiences</T>
          </Typography>
          <div className={classes.search}>
            <SearchField onChange={this.handleSearchAudiences.bind(this)} />
          </div>
          <div className="clearfix" />
        </div>
        {this.props.audiences.length === 0 && (
          <div className={classes.empty}>
            <T>You do not have any audiences in this exercise.</T>
          </div>
        )}
        <List>
          {filteredAudiences.map((audience) => (
            <ListItem
              key={audience.audience_id}
              component={Link}
              button={true}
              to={`/private/exercise/${this.props.exerciseId}/audiences/${audience.audience_id}`}
              divider={true}
            >
              <ListItemIcon
                className={
                  audience.audience_enabled ? classes.enabled : classes.disabled
                }
              >
                <GroupOutlined />
              </ListItemIcon>
              <ListItemText
                primary={audience.audience_name}
                secondary={
                  <span>
                    {audience.audience_users_number} <T>players</T>
                  </span>
                }
              />
              <ListItemSecondaryAction>
                <KeyboardArrowRightOutlined />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {userCanUpdate && (
          <CreateAudience exerciseId={this.props.exerciseId} />
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
};

const filteredAudiences = (audiences, exerciseId) => {
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  );
  return audiencesFilterAndSorting(audiences);
};

const select = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const exercise = state.referential.entities.exercises[ownProps.id];
  const audiences = filteredAudiences(state.referential.entities.audiences, exerciseId);
  return {
    exerciseId,
    exercise,
    audiences,
  };
};

export default R.compose(
  connect(select, {
    fetchAudiences,
    fetchGroups,
  }),
  withStyles(styles),
)(IndexAudiences);
