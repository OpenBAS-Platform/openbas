import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { MoreVert } from '@material-ui/icons';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { withStyles } from '@material-ui/core/styles';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import {
  updateIncident,
  deleteIncident,
  selectIncident,
} from '../../../../../actions/Incident';
import IncidentForm from './IncidentForm';
import IncidentSubobjectives from './IncidentSubobjectives';
import { submitForm } from '../../../../../utils/Action';

const styles = () => ({
  empty: {
    margin: '0 auto',
    marginTop: '10px',
    textAlign: 'center',
  },
});

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Subobjectives': '2. Sous-objectifs',
    'Update the incident': "Modifier l'incident",
    'Do you want to delete this incident?':
      'Souhaitez-vous supprimer cet incident ?',
    'No subobjective found.': 'Aucun sous-objectif trouvé.',
    'Search for a subobjective': 'Rechercher un sous-objectif',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class IncidentPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      subobjectivesIds: this.props.incidentSubobjectivesIds,
      stepIndex: 0,
      finished: false,
      incidentData: null,
    };
  }

  handlePopoverOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({
      openEdit: false,
      stepIndex: 0,
      finished: false,
      injectData: null,
    });
  }

  onGlobalSubmit(data) {
    this.setState({ incidentData: data }, () => this.selectSubobjectives());
  }

  onSubobjectivesChange(data) {
    const { incidentData } = this.state;
    incidentData.incident_subobjectives = data;
    this.setState({ incidentData });
  }

  handleNext() {
    if (this.state.stepIndex === 0) {
      submitForm('incidentForm');
    } else if (this.state.stepIndex === 1) {
      this.updateIncident();
    }
  }

  selectSubobjectives() {
    this.setState({ stepIndex: 1, finished: true });
  }

  updateIncident() {
    this.props.updateIncident(
      this.props.exerciseId,
      this.props.eventId,
      this.props.incident.incident_id,
      this.state.incidentData,
    );
    this.handleCloseEdit();
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
      .deleteIncident(
        this.props.exerciseId,
        this.props.eventId,
        this.props.incident.incident_id,
      )
      .then(() => {
        this.props.selectIncident(
          this.props.exerciseId,
          this.props.eventId,
          undefined,
        );
      });
    this.handleCloseDelete();
  }

  getStepContent(stepIndex, initialValues) {
    switch (stepIndex) {
      case 0:
        return (
          <IncidentForm
            initialValues={initialValues}
            onSubmit={this.onGlobalSubmit.bind(this)}
            types={this.props.incident_types}
          />
        );
      case 1:
        return (
          <IncidentSubobjectives
            exerciseId={this.props.exerciseId}
            eventId={this.props.eventId}
            onChange={this.onSubobjectivesChange.bind(this)}
            subobjectives={this.props.subobjectives}
            incidentSubobjectivesIds={this.props.incidentSubobjectivesIds}
          />
        );
      default:
        return 'Go away!';
    }
  }

  render() {
    const incidentIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.incident,
    );
    const incidentIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.incident,
    );
    const initialValues = R.pick(
      [
        'incident_title',
        'incident_story',
        'incident_type',
        'incident_weight',
        'incident_order',
      ],
      this.props.incident,
    );
    return (
      <div>
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
            onClick={this.handleOpenEdit.bind(this)}
            disabled={!incidentIsUpdatable}
          >
            <T>Edit</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={!incidentIsDeletable}
          >
            <T>Delete</T>
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to delete this incident?</T>
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
          TransitionComponent={Transition}
          onClose={this.handleCloseEdit.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>
            <Stepper linear={false} activeStep={this.state.stepIndex}>
              <Step>
                <StepLabel>
                  <T>1. Parameters</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>2. Subobjectives</T>
                </StepLabel>
              </Step>
            </Stepper>
          </DialogTitle>
          <DialogContent>
            {this.getStepContent(this.state.stepIndex, initialValues)}
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
              onClick={this.handleNext.bind(this)}
            >
              <T>{this.state.stepIndex === 1 ? 'Update' : 'Next'}</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

IncidentPopover.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  deleteIncident: PropTypes.func,
  updateIncident: PropTypes.func,
  selectIncident: PropTypes.func,
  fetchSubobjectives: PropTypes.func,
  incident: PropTypes.object,
  incident_types: PropTypes.object,
  incidentSubobjectivesIds: PropTypes.array,
  subobjectives: PropTypes.array,
};

const select = (state) => ({
  incident_types: state.referential.entities.incident_types,
});

export default R.compose(
  connect(select, {
    updateIncident,
    deleteIncident,
    selectIncident,
  }),
  withStyles(styles),
)(IncidentPopover);
