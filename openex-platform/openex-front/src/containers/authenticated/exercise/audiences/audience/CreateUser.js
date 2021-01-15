import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { i18nRegister } from '../../../../../utils/Messages';
import { addUser } from '../../../../../actions/User';
import UserForm from './UserForm';
import * as Constants from '../../../../../constants/ComponentTypes';

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
    return this.props.addUser(data);
  }

  submitFormCreate() {
    this.refs.userForm.submit();
  }

  render() {
    const actionsCreateUser = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseCreate.bind(this)}
      />,
      <Button
        key="create"
        label="Create user"
        primary={true}
        onClick={this.submitFormCreate.bind(this)}
      />,
    ];

    return (
      <div>
        <Button
          label="Create a new user"
          secondary={true}
          onClick={this.handleOpenCreate.bind(this)}
          type={Constants.BUTTON_TYPE_DIALOG_LEFT}
        />
        <Dialog
          title="Create a new user"
          modal={false}
          open={this.state.openCreate}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseCreate.bind(this)}
          actions={actionsCreateUser}
        >
          {/* eslint-disable */}
          <UserForm
            ref="userForm"
            onSubmit={this.onSubmitCreate.bind(this)}
            organizations={this.props.organizations}
            onSubmitSuccess={this.handleCloseCreate.bind(this)}
          />
          {/* eslint-enable */}
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
