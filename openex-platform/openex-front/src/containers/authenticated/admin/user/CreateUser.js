import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Fab from '@material-ui/core/Fab';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { i18nRegister } from '../../../../utils/Messages';
import { addUser } from '../../../../actions/User';
import UserForm from './UserForm';
import * as Constants from '../../../../constants/ComponentTypes';

i18nRegister({
  fr: {
    'Create user': "Créer l'utilisateur",
    'Create a user': 'Créer un utilisateur',
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
        <Fab
          type={Constants.BUTTON_TYPE_FLOATING}
          onClick={this.handleOpenCreate.bind(this)}
        />
        <Dialog
          title="Create a user"
          autoScrollBodyContent={true}
          modal={false}
          open={this.state.openCreate}
          onClose={this.handleCloseCreate.bind(this)}
          actions={actionsCreateUser}
        >
          {/* eslint-disable */}
          <UserForm
            ref="userForm"
            editing={false}
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
  organizations: PropTypes.object,
  addUser: PropTypes.func,
};

const select = (state) => ({
  organizations: state.referential.entities.organizations,
});

export default connect(select, { addUser })(CreateUser);
