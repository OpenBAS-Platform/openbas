import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { i18nRegister } from '../../../../../utils/Messages';
import { addUser } from '../../../../../actions/User';
import { T } from '../../../../../components/I18n';
import UserForm from './UserForm';
import { submitForm } from '../../../../../utils/Action';

i18nRegister({
  fr: {
    'Create user': 'Créer un utilisateur',
    'Create a new user': 'Créer un nouvel utilisateur',
  },
});

class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.state = { openCreate: false };
  }

  handleOpenCreate() {
    this.setState({ openCreate: true });
  }

  handleCloseCreate() {
    this.setState({ openCreate: false });
  }

  onSubmitCreate(data) {
    return this.props
      .addUser(data)
      .then((result) => (result.result ? this.handleCloseCreate() : result));
  }

  render() {
    return (
      <div>
        <Button
          variant="outlined"
          color="primary"
          onClick={this.handleOpenCreate.bind(this)}
        >
          <T>Create a user</T>
        </Button>
        <Dialog
          open={this.state.openCreate}
          onClose={this.handleCloseCreate.bind(this)}
        >
          <DialogTitle>
            <T>Create a new user</T>
          </DialogTitle>
          <DialogContent>
            <UserForm
              onSubmit={this.onSubmitCreate.bind(this)}
              organizations={this.props.organizations}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseCreate.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('userForm')}
            >
              <T>Create a user</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateUser.propTypes = {
  exerciseId: PropTypes.string,
  organizations: PropTypes.object,
  addUser: PropTypes.func,
};

const select = (state) => ({
  organizations: state.referential.entities.organizations,
});

export default connect(select, {
  addUser,
})(CreateUser);
