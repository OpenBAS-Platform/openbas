import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { Popover } from '../../../../components/Popover';
import { Menu } from '../../../../components/Menu';
import { Icon } from '../../../../components/Icon';
import { MenuItemLink } from '../../../../components/menu/MenuItem';
import { updateOutcome } from '../../../../actions/Outcome';
import OutcomeForm from './OutcomeForm';

const style = {
  position: 'absolute',
  top: '7px',
  right: 0,
};

i18nRegister({
  fr: {
    'Update the outcome': 'Modifier le résultat',
  },
});

class IncidentPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openEdit: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    });
  }

  handlePopoverClose() {
    this.setState({ openPopover: false });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    return this.props.updateOutcome(
      this.props.exerciseId,
      this.props.incident.incident_event.event_id,
      this.props.incident.incident_id,
      this.props.incident.incident_outcome.outcome_id,
      data,
    );
  }

  submitFormEdit() {
    this.refs.outcomeForm.submit();
  }

  render() {
    const editActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      <Button
        key="update"
        label="Update"
        primary={true}
        onClick={this.submitFormEdit.bind(this)}
      />,
    ];

    const initialValues = R.pick(
      ['outcome_result', 'outcome_comment'],
      this.props.incident.incident_outcome,
    );
    const incidentIsUpdatable = R.propOr(
      false,
      'user_can_update',
      this.props.incident,
    );
    return (
      <div style={style}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          type={Constants.BUTTON_TYPE_MAINLIST2}
        >
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} />
        </IconButton>

        {incidentIsUpdatable ? (
          <Popover
            open={this.state.openPopover}
            anchorEl={this.state.anchorEl}
            onRequestClose={this.handlePopoverClose.bind(this)}
          >
            <Menu multiple={false}>
              <MenuItemLink
                label="Edit"
                onClick={this.handleOpenEdit.bind(this)}
              />
            </Menu>
          </Popover>
        ) : (
          ''
        )}

        <Dialog
          title="Update the outcome"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          {/* eslint-disable */}
          <OutcomeForm
            ref="outcomeForm"
            initialValues={initialValues}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

IncidentPopover.propTypes = {
  exerciseId: PropTypes.string,
  incident: PropTypes.object,
  updateOutcome: PropTypes.func,
};

export default connect(null, { updateOutcome })(IncidentPopover);
