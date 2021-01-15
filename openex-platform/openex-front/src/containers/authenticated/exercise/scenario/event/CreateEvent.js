import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Dialog from '@material-ui/core/Dialog';
import { i18nRegister } from '../../../../../utils/Messages';
import * as Constants from '../../../../../constants/ComponentTypes';
import { addEvent } from '../../../../../actions/Event';
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
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleClose.bind(this)}
      />,
      <Button
        key="create"
        label="Create"
        primary={true}
        onClick={this.submitForm.bind(this)}
      />,
    ];

    return (
      <div>
        <Fab
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
          <EventForm
            ref="eventForm"
            onSubmit={this.onSubmit.bind(this)}
            onSubmitSuccess={this.handleClose.bind(this)}
          />
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
