import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { i18nRegister } from '../../../../../utils/Messages';
import { Dialog } from '../../../../../components/Dialog';
import { FlatButton } from '../../../../../components/Button';
import { addTag } from '../../../../../actions/Tag';
import TagForm from './TagForm';

i18nRegister({
  fr: {
    'Create a new tag': 'Créer un nouveau TAG',
  },
});

class CreateTag extends Component {
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
    this.props.addTag(data);
  }

  submitForm() {
    this.refs.tagForm.submit();
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
        <FlatButton
          label="Create a new tag"
          primary={true}
          onClick={this.handleOpen.bind(this)}
        />
        <Dialog
          title="Create a new tag"
          modal={false}
          open={this.state.open}
          actions={actions}
          onRequestClose={this.handleClose.bind(this)}
        >
          {/* eslint-disable */}
          <TagForm
            ref="tagForm"
            onSubmit={this.onSubmit.bind(this)}
            onSubmitSuccess={this.handleClose.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

CreateTag.propTypes = {
  addTag: PropTypes.func,
};

export default connect(null, { addTag })(CreateTag);
