import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { fetchOrganizations } from '../../../actions/Organization';
import { updateUser } from '../../../actions/User';
import { i18nRegister } from '../../../utils/Messages';
import { T } from '../../../components/I18n';
import UserForm from './UserForm';
import ProfileForm from './ProfileForm';
import PasswordForm from './PasswordForm';
import UserPopover from '../UserPopover';

i18nRegister({
  fr: {
    Firstname: 'Prénom',
    Lastname: 'Nom',
    Organization: 'Organisation',
    Profile: 'Profil',
    Password: 'Mot de passe',
    Information: 'Informations',
  },
});

const styles = (theme) => ({
  paper: {
    padding: 20,
    marginBottom: 40,
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    padding: 20,
  },
  logo: {
    width: '40px',
    cursor: 'pointer',
  },
  title: {
    fontSize: 25,
    marginLeft: 20,
  },
  toolbar: theme.mixins.toolbar,
});

class Index extends Component {
  componentDidMount() {
    this.props.fetchOrganizations();
  }

  onUpdate(data) {
    return this.props.updateUser(this.props.user.user_id, data);
  }

  onUpdatePassword(data) {
    return this.props.updateUser(this.props.user.user_id, {
      user_plain_password: data.user_plain_password,
    });
  }

  submitUser() {
    this.refs.userForm.submit();
  }

  submitProfile() {
    this.refs.profileForm.submit();
  }

  submitPassword() {
    this.refs.passwordForm.submit();
  }

  redirectToHome() {
    this.props.history.push('/private');
  }

  render() {
    const { classes } = this.props;
    const organizationPath = [
      R.propOr('-', 'user_organization', this.props.user),
      'organization_name',
    ];
    const organizationName = R.pathOr(
      '-',
      organizationPath,
      this.props.organizations,
    );
    const initPipe = R.pipe(
      R.assoc('user_organization', organizationName), // Reformat organization
      R.pick([
        'user_firstname',
        'user_lastname',
        'user_lang',
        'user_email',
        'user_email2',
        'user_organization',
        'user_phone',
        'user_phone2',
        'user_phone3',
        'user_pgp_key',
      ]),
    );
    const informationValues = this.props.user !== undefined ? initPipe(this.props.user) : undefined;
    return (
      <div>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <img
              src="/images/logo_white.png"
              alt="logo"
              className={classes.logo}
              onClick={this.redirectToHome.bind(this)}
            />
            <div className={classes.title}>OpenEx</div>
            <UserPopover />
          </Toolbar>
        </AppBar>
        <div className={classes.toolbar} />
        <div className={classes.container}>
          <div style={{ width: 800, margin: '0 auto' }}>
            <Paper elevation={4} className={classes.paper}>
              <Typography variant="h5" style={{ marginBottom: 20 }}>
                <T>Profile</T>
              </Typography>
              <UserForm
                ref="userForm"
                organizations={this.props.organizations}
                onSubmit={this.onUpdate.bind(this)}
                initialValues={informationValues}
              />
              <br />
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.submitUser.bind(this)}
              >
                <T>Update</T>
              </Button>
            </Paper>
            <Paper elevation={4} className={classes.paper}>
              <Typography variant="h5" style={{ marginBottom: 20 }}>
                <T>Information</T>
              </Typography>
              <ProfileForm
                ref="profileForm"
                onSubmit={this.onUpdate.bind(this)}
                initialValues={informationValues}
              />
              <br />
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.submitProfile.bind(this)}
              >
                <T>Update</T>
              </Button>
            </Paper>
            <Paper elevation={4} className={classes.paper}>
              <Typography variant="h5" style={{ marginBottom: 20 }}>
                <T>Password</T>
              </Typography>
              <PasswordForm
                ref="passwordForm"
                onSubmit={this.onUpdatePassword.bind(this)}
              />
              <br />
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.submitPassword.bind(this)}
              >
                <T>Update</T>
              </Button>
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  user: PropTypes.object,
  organizations: PropTypes.object,
  fetchOrganizations: PropTypes.func,
  updateUser: PropTypes.func,
};

const select = (state) => {
  const userId = R.path(['logged', 'user'], state.app);
  return {
    user: R.prop(userId, state.referential.entities.users),
    organizations: state.referential.entities.organizations,
  };
};

export default R.compose(
  connect(select, { fetchOrganizations, updateUser }),
  withStyles(styles),
)(Index);
