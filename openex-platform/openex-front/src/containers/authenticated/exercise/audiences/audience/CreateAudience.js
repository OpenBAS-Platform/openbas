import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { i18nRegister } from '../../../../../utils/Messages';
import * as Constants from '../../../../../constants/ComponentTypes';
import { addAudience } from '../../../../../actions/Audience';
import { Dialog } from '../../../../../components/Dialog';
import {
  FlatButton,
  FloatingActionsButtonCreate,
} from '../../../../../components/Button';
import AudienceForm from './AudienceForm';

i18nRegister({
  fr: {
    'Create a new audience': 'Créer une nouvelle audience',
  },
});

class CreateAudience extends Component {
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
    return this.props.addAudience(this.props.exerciseId, data);
  }

  submitForm() {
    this.refs.audienceForm.submit();
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
          title="Create a new audience"
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}
        >
          <AudienceForm
            ref="audienceForm"
            onSubmit={this.onSubmit.bind(this)}
            onSubmitSuccess={this.handleClose.bind(this)}
          />
        </Dialog>
      </div>
    );
  }
}

CreateAudience.propTypes = {
  exerciseId: PropTypes.string,
  addAudience: PropTypes.func,
  onCreate: PropTypes.func,
};

export default connect(null, {
  addAudience,
})(CreateAudience);
