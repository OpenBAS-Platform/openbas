import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { addGroup } from '../../../../actions/Group';
import UserForm from './GroupForm';
import * as Constants from '../../../../constants/ComponentTypes';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {
    'Create a group': 'Créer un groupe',
    'Create group': 'Créer le groupe',
  },
});

class CreateGroup extends Component {
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
    return this.props.addGroup(data);
  }

  submitFormCreate() {
    this.refs.groupForm.submit();
  }

  render() {
    const actionsCreateGroup = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseCreate.bind(this)}
      />,
      <Button
        key="create"
        label="Create group"
        primary={true}
        onClick={this.submitFormCreate.bind(this)}
      />,
    ];

    return (
      <div>
        <Button
          type={Constants.BUTTON_TYPE_FLOATING}
          onClick={this.handleOpenCreate.bind(this)}
        />
        <Dialog
          title="Create a group"
          modal={false}
          open={this.state.openCreate}
          onRequestClose={this.handleCloseCreate.bind(this)}
          actions={actionsCreateGroup}
        >
          {/* eslint-disable */}
          <UserForm
            ref="groupForm"
            onSubmit={this.onSubmitCreate.bind(this)}
            onSubmitSuccess={this.handleCloseCreate.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

CreateGroup.propTypes = {
  addGroup: PropTypes.func,
};

export default connect(null, { addGroup })(CreateGroup);
