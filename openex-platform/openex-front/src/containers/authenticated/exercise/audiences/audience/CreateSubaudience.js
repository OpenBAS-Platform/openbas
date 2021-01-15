import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import * as Constants from '../../../../../constants/ComponentTypes';
import AppBar from '../../../../../components/AppBar';
import SubaudienceForm from './SubaudienceForm';
import {
  addSubaudience,
  selectSubaudience,
} from '../../../../../actions/Subaudience';

i18nRegister({
  fr: {
    'Sub-audiences': 'Sous-audiences',
    'Create a new sub-audience': 'Créer une nouvelle sous-audience',
  },
});

class CreateSubaudience extends Component {
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
      .addSubaudience(this.props.exerciseId, this.props.audienceId, data)
      .then((payload) => {
        this.props.selectSubaudience(
          this.props.exerciseId,
          this.props.audienceId,
          payload.result,
        );
      });
  }

  submitFormCreate() {
    this.refs.subaudienceForm.submit();
  }

  render() {
    const actions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseCreate.bind(this)}
      />,
      <Button
        key="create"
        label="Create"
        primary={true}
        onClick={this.submitFormCreate.bind(this)}
      />,
    ];

    return (
      <div>
        {this.props.can_create ? (
          <AppBar
            title={<T>Sub-audiences</T>}
            showMenuIconButton={false}
            iconElementRight={
              <Button
                type={Constants.BUTTON_TYPE_CREATE_RIGHT}
                onClick={this.handleOpenCreate.bind(this)}
              />
            }
          />
        ) : (
          <AppBar title={<T>Sub-audiences</T>} showMenuIconButton={false} />
        )}
        <Dialog
          title="Create a new sub-audience"
          modal={false}
          open={this.state.openCreate}
          onRequestClose={this.handleCloseCreate.bind(this)}
          actions={actions}
        >
          {/* eslint-disable */}
          <SubaudienceForm
            ref="subaudienceForm"
            onSubmit={this.onSubmitCreate.bind(this)}
            onSubmitSuccess={this.handleCloseCreate.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

CreateSubaudience.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  addSubaudience: PropTypes.func,
  selectSubaudience: PropTypes.func,
  can_create: PropTypes.bool,
};

export default connect(null, {
  addSubaudience,
  selectSubaudience,
})(CreateSubaudience);
