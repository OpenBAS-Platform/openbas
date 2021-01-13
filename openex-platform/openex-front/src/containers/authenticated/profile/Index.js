import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { fetchOrganizations } from '../../../actions/Organization';
import { updateUser } from '../../../actions/User';
import { i18nRegister } from '../../../utils/Messages';
import { T } from '../../../components/I18n';
import UserForm from './UserForm';
import ProfileForm from './ProfileForm';
import PasswordForm from './PasswordForm';

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

const styles = () => ({
  paper: {
    padding: 20,
    marginBottom: 40,
  },
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
      <div style={{ width: 800, margin: '0 auto' }}>
        <Paper elevation={4} className={classes.paper}>
          <h2>
            <T>Profile</T>
          </h2>
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
          <h2>
            <T>Information</T>
          </h2>
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
          <h2>
            <T>Password</T>
          </h2>
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
