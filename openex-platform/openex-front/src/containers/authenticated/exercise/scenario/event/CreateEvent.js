import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { i18nRegister } from '../../../../../utils/Messages';
import * as Constants from '../../../../../constants/ComponentTypes';
import { addEvent } from '../../../../../actions/Event';
import { Dialog } from '../../../../../components/Dialog';
import {
  FlatButton,
  FloatingActionsButtonCreate,
} from '../../../../../components/Button';
import EventForm from './EventForm';

i18nRegister({
  fr: {
    'Create a new event': 'Créer un nouvel événement',
  },
});

class CreateEvent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(data) {
    return this.props.addEvent(this.props.exerciseId, data);
  }

  submitForm() {
    this.refs.eventForm.submit();
  }

  render() {
    const actions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleClose.bind(this)}
      />,
      <FlatButton
        key="create"
        label="Create"
        primary={true}
        onClick={this.submitForm.bind(this)}
      />,
    ];

    return (
      <div>
        <FloatingActionsButtonCreate
          type={Constants.BUTTON_TYPE_FLOATING}
          onClick={this.handleOpen.bind(this)}
        />
        <Dialog
          title="Create a new event"
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}
        >
          {/* eslint-disable */}
          <EventForm
            ref="eventForm"
            onSubmit={this.onSubmit.bind(this)}
            onSubmitSuccess={this.handleClose.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

CreateEvent.propTypes = {
  exerciseId: PropTypes.string,
  addEvent: PropTypes.func,
};

export default connect(null, { addEvent })(CreateEvent);
