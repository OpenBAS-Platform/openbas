import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { redirectToScenario } from '../../../../../actions/Application';
import * as Constants from '../../../../../constants/ComponentTypes';
import { Popover } from '../../../../../components/Popover';
import { Menu } from '../../../../../components/Menu';
import { Dialog } from '../../../../../components/Dialog';
import { IconButton, FlatButton } from '../../../../../components/Button';
import { Icon } from '../../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../../components/menu/MenuItem';
import {
  updateEvent,
  deleteEvent,
  importEvent,
} from '../../../../../actions/Event';
import {
  getPlanificateurUserForEvent,
  updatePlanificateurUserForEvent,
} from '../../../../../actions/Planificateurs';
import EventForm from './EventForm';
import PlanificateurEvent from '../../planificateurs/PlanificateurEvent';

const style = {
  margin: '8px -30px 0 0',
};

i18nRegister({
  fr: {
    'Update the event': "Modifier l'événement",
    'Do you want to delete this event?':
      'Souhaitez-vous supprimer cet événement ?',
    Import: 'Importer',
  },
});

class EventPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      exerciseOwner: '',
      openPlanificateur: false,
      planificateursEvent: [],
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();

    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    });
  }

  handleClosePlanificateur() {
    this.setState({ openPlanificateur: false });
  }

  submitFormPlanificateur() {
    this.props.updatePlanificateurUserForEvent(
      this.props.exerciseId,
      this.props.eventId,
      this.state.planificateursEvent,
    );
    this.setState({ openPlanificateur: false });
  }

  handleOpenPlanificateur() {
    this.props
      .getPlanificateurUserForEvent(this.props.exerciseId, this.props.eventId)
      .then((data) => {
        this.setState({ planificateursEvent: [] });
        const listePlanificateursEvent = [...this.state.planificateursEvent];
        data.result.forEach((planificateur) => {
          const dataPlanificateur = {
            user_id: planificateur.user_id,
            user_firstname: planificateur.user_firstname,
            user_lastname: planificateur.user_lastname,
            user_email: planificateur.user_email,
            is_planificateur_event: planificateur.is_planificateur_event,
          };
          listePlanificateursEvent.push(dataPlanificateur);
        });
        this.setState({ planificateursEvent: listePlanificateursEvent });
        this.setState({ openPopover: false });
        this.setState({ openPlanificateur: true });
      });
  }

  handlePopoverClose() {
    this.setState({ openPopover: false });
  }

  handleOpenEdit() {
    this.setState({
      openEdit: true,
    });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({
      openEdit: false,
    });
  }

  handleCheckPlanificateur(userId, eventId, isChecked) {
    const liste_planificateurs = [...this.state.planificateursEvent];
    liste_planificateurs.forEach((user) => {
      if (user.user_id === userId) {
        user.is_planificateur_event = isChecked;
      }
    });
    this.setState({ planificateursEvent: liste_planificateurs });
  }

  onSubmitEdit(data) {
    return this.props.updateEvent(
      this.props.exerciseId,
      this.props.eventId,
      data,
    );
  }

  submitFormEdit() {
    this.refs.eventForm.submit();
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props
      .deleteEvent(this.props.exerciseId, this.props.eventId)
      .then(() => this.props.redirectToScenario(this.props.exerciseId));
    this.handleCloseDelete();
  }

  openFileDialog() {
    this.refs.fileUpload.click();
  }

  handleFileChange() {
    const data = new FormData();
    data.append('file', this.refs.fileUpload.files[0]);
    this.props
      .importEvent(this.props.exerciseId, this.props.eventId, data)
      .then(() => this.props.reloadEvent());
    this.handlePopoverClose();
  }

  render() {
    const event_is_updatable = R.propOr(
      true,
      'user_can_update',
      this.props.event,
    );
    const event_is_deletable = R.propOr(
      true,
      'user_can_delete',
      this.props.event,
    );
    const { userCanUpdate } = this.props;

    const editActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      event_is_updatable ? (
        <FlatButton
          key="update"
          label="Update"
          primary={true}
          onClick={this.submitFormEdit.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const deleteActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDelete.bind(this)}
      />,
      event_is_deletable ? (
        <FlatButton
          key="delete"
          label="Delete"
          primary={true}
          onClick={this.submitDelete.bind(this)}
        />
      ) : (
        ''
      ),
    ];

    const initialValues = R.pick(
      ['event_title', 'event_description', 'event_order'],
      this.props.event,
    );
    const { exerciseOwnerId } = this.props;
    const { userId } = this.props;

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon
            color="#ffffff"
            name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}
          />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.handlePopoverClose.bind(this)}
        >
          {(event_is_updatable || event_is_deletable) && userCanUpdate ? (
            <Menu multiple={false}>
              <MenuItemLink
                label="Import"
                onClick={this.openFileDialog.bind(this)}
              />
              {exerciseOwnerId === userId ? (
                <MenuItemLink
                  label="Liste des planificateurs"
                  onClick={this.handleOpenPlanificateur.bind(this)}
                />
              ) : (
                ''
              )}
              {event_is_updatable ? (
                <MenuItemLink
                  label="Edit"
                  onClick={this.handleOpenEdit.bind(this)}
                />
              ) : (
                ''
              )}
              {event_is_deletable ? (
                <MenuItemButton
                  label="Delete"
                  onClick={this.handleOpenDelete.bind(this)}
                />
              ) : (
                ''
              )}
            </Menu>
          ) : (
            ''
          )}
          <input
            type="file"
            ref="fileUpload"
            style={{ display: 'none' }}
            onChange={this.handleFileChange.bind(this)}
          />
        </Popover>

        <PlanificateurEvent
          planificateursEvent={this.state.planificateursEvent}
          eventId={this.props.eventId}
          handleCheckPlanificateur={this.handleCheckPlanificateur.bind(this)}
          openPlanificateur={this.state.openPlanificateur}
          handleClosePlanificateur={this.handleClosePlanificateur.bind(this)}
          submitFormPlanificateur={this.submitFormPlanificateur.bind(this)}
        />

        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          <T>Do you want to delete this event?</T>
        </Dialog>
        <Dialog
          title="Update the event"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <EventForm
            ref="eventForm"
            initialValues={initialValues}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
        </Dialog>
      </div>
    );
  }
}

EventPopover.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  event: PropTypes.object,
  deleteEvent: PropTypes.func,
  updateEvent: PropTypes.func,
  redirectToScenario: PropTypes.func,
  importEvent: PropTypes.func,
  children: PropTypes.node,
  reloadEvent: PropTypes.func,
  getPlanificateurUserForEvent: PropTypes.func,
  updatePlanificateurUserForEvent: PropTypes.func,
  userCanUpdate: PropTypes.bool,
};

const select = (state, ownProps) => {
  const userId = R.path(['logged', 'user'], state.app);
  const exercise = R.prop(
    ownProps.exerciseId,
    state.referential.entities.exercises,
  );
  const exerciseOwnerId = R.prop('exercise_owner_id', exercise);
  return {
    exerciseOwnerId,
    userId,
  };
};

export default connect(select, {
  updatePlanificateurUserForEvent,
  getPlanificateurUserForEvent,
  updateEvent,
  deleteEvent,
  importEvent,
  redirectToScenario,
})(EventPopover);
