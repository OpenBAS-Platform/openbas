import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import {
  RowingOutlined,
  GroupOutlined,
  CallToActionOutlined,
} from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import { T } from '../../../components/I18n';
import { i18nRegister } from '../../../utils/Messages';
import { fetchExercises } from '../../../actions/Exercise';
import { fetchUsers } from '../../../actions/User';
import { fetchGlobalInjects } from '../../../actions/Inject';

i18nRegister({
  fr: {
    Exercises: 'Exercices',
    Users: 'Utilisateurs',
    Injects: 'Injects',
  },
});

const styles = (theme) => ({
  container: {
    padding: '50px 0px 0px 0px',
    textAlign: 'center',
  },
  number: {
    fontSize: '60px',
    fontWeight: '400',
    color: theme.palette.primary.main,
  },
  icon: {
    margin: '35px 0px 0px 0px',
    fontWeight: '400',
  },
  name: {
    fontSize: '12px',
    textTransform: 'uppercase',
  },
});

class Index extends Component {
  componentDidMount() {
    this.props.fetchExercises();
    this.props.fetchUsers();
    this.props.fetchGlobalInjects();
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={4}>
            <div className={classes.number}>{this.props.exercises.length}</div>
            <div className={classes.icon}>
              <RowingOutlined fontSize="large" color="primary" />
            </div>
            <div className={classes.name}>
              <T>Exercises</T>
            </div>
          </Grid>
          <Grid item={true} xs={4}>
            <div className={classes.number}>{this.props.users.length}</div>
            <div className={classes.icon}>
              <GroupOutlined fontSize="large" color="primary" />
            </div>
            <div className={classes.name}>
              <T>Users</T>
            </div>
          </Grid>
          <Grid item={true} xs={4}>
            <div className={classes.number}>{this.props.injects.length}</div>
            <div className={classes.icon}>
              <CallToActionOutlined fontSize="large" color="primary" />
            </div>
            <div className={classes.name}>
              <T>Injects</T>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Index.propTypes = {
  exercises: PropTypes.array,
  users: PropTypes.array,
  injects: PropTypes.array,
  fetchExercises: PropTypes.func,
  fetchUsers: PropTypes.func,
  fetchGlobalInjects: PropTypes.func,
};

const select = (state) => ({
  exercises: R.values(state.referential.entities.exercises),
  users: R.values(state.referential.entities.users),
  injects: R.values(state.referential.entities.injects),
});

export default R.compose(
  connect(select, {
    fetchExercises,
    fetchUsers,
    fetchGlobalInjects,
  }),
  withStyles(styles),
)(Index);
