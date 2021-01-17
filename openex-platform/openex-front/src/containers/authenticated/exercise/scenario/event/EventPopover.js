import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { MoreVert } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { redirectToScenario } from '../../../../../actions/Application';
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
import { submitForm } from '../../../../../utils/Action';

const styles = () => ({
  container: {
    float: 'left',
    marginTop: -8,
  },
});

i18nRegister({
  fr: {
    'Update the event': "Modifier l'événement",
    'Do you want to delete this event?':
      'Souhaitez-vous supprimer cet événement ?',
    Import: 'Importer',
    'Planners list': 'Liste des planificateurs',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

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
        this.setState({ anchorEl: null });
        this.setState({ openPlanificateur: true });
      });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
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
    const listePlanificateurs = [...this.state.planificateursEvent];
    listePlanificateurs.forEach((user) => {
      if (user.user_id === userId) {
        // eslint-disable-next-line no-param-reassign
        user.is_planificateur_event = isChecked;
      }
    });
    this.setState({ planificateursEvent: listePlanificateurs });
  }

  onSubmitEdit(data) {
    return this.props
      .updateEvent(this.props.exerciseId, this.props.eventId, data)
      .then(() => this.handleCloseEdit());
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
    const {
      classes, exerciseOwnerId, userId, userCanUpdate,
    } = this.props;
    const eventIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.event,
    );
    const eventIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.event,
    );
    const initialValues = R.pick(
      ['event_title', 'event_description', 'event_order'],
      this.props.event,
    );
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem
            onClick={this.openFileDialog.bind(this)}
            disabled={!eventIsUpdatable || !userCanUpdate}
          >
            <T>Import</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenPlanificateur.bind(this)}
            disabled={exerciseOwnerId !== userId}
          >
            <T>Planners list</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenEdit.bind(this)}
            disabled={!eventIsUpdatable || !userCanUpdate}
          >
            <T>Edit</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={!eventIsDeletable || !userCanUpdate}
          >
            <T>Delete</T>
          </MenuItem>
        </Menu>
        <input
          type="file"
          ref="fileUpload"
          style={{ display: 'none' }}
          onChange={this.handleFileChange.bind(this)}
        />
        <PlanificateurEvent
          planificateursEvent={this.state.planificateursEvent}
          eventId={this.props.eventId}
          handleCheckPlanificateur={this.handleCheckPlanificateur.bind(this)}
          openPlanificateur={this.state.openPlanificateur}
          handleClosePlanificateur={this.handleClosePlanificateur.bind(this)}
          submitFormPlanificateur={this.submitFormPlanificateur.bind(this)}
        />
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to delete this event?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDelete.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDelete.bind(this)}
            >
              <T>Delete</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
        >
          <DialogTitle>
            <T>Update the event</T>
          </DialogTitle>
          <DialogContent>
            <EventForm
              initialValues={initialValues}
              onSubmit={this.onSubmitEdit.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEdit.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('eventForm')}
            >
              <T>Update</T>
            </Button>
          </DialogActions>
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

export default R.compose(
  connect(select, {
    updatePlanificateurUserForEvent,
    getPlanificateurUserForEvent,
    updateEvent,
    deleteEvent,
    importEvent,
    redirectToScenario,
  }),
  withStyles(styles),
)(EventPopover);
