import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { Add } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import IncidentForm from './IncidentForm';
import IncidentSubobjectives from './IncidentSubobjectives';
import { addIncident, selectIncident } from '../../../../../actions/Incident';
import { submitForm } from '../../../../../utils/Action';

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Subobjectives': '2. Sous-objectifs',
    Incidents: 'Incidents',
    'Create a new incident': 'Créer un nouvel incident',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    float: 'left',
    marginTop: -8,
  },
});

class CreateIncident extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openCreate: false,
      stepIndex: 0,
      finished: false,
      incidentData: null,
    };
  }

  handleOpenCreate() {
    this.setState({ openCreate: true });
  }

  handleCloseCreate() {
    this.setState({
      openCreate: false,
      stepIndex: 0,
      finished: false,
      incidentData: null,
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
      this.createIncident();
    }
  }

  selectSubobjectives() {
    this.setState({ stepIndex: 1, finished: true });
  }

  createIncident() {
    this.props
      .addIncident(
        this.props.exerciseId,
        this.props.eventId,
        this.state.incidentData,
      )
      .then((payload) => {
        this.props.selectIncident(
          this.props.exerciseId,
          this.props.eventId,
          payload.result,
        );
      });
    this.handleCloseCreate();
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <IncidentForm
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
            incidentSubobjectivesIds={[]}
          />
        );
      default:
        return 'Go away!';
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div style={{ margin: '15px 0 0 15px' }}>
        <Typography variant="h5" style={{ float: 'left' }}>
          <T>Incidents</T>
        </Typography>
        <IconButton
          className={classes.createButton}
          onClick={this.handleOpenCreate.bind(this)}
          color="secondary"
        >
          <Add />
        </IconButton>
        <Dialog
          open={this.state.openCreate}
          TransitionComponent={Transition}
          onClose={this.handleCloseCreate.bind(this)}
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
            {this.getStepContent(this.state.stepIndex)}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseCreate.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.handleNext.bind(this)}
            >
              <T>{this.state.stepIndex === 1 ? 'Create' : 'Next'}</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateIncident.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incident_types: PropTypes.object,
  subobjectives: PropTypes.array,
  addIncident: PropTypes.func,
  selectIncident: PropTypes.func,
  can_create: PropTypes.bool,
};

export default R.compose(
  connect(null, { addIncident, selectIncident }),
  withStyles(styles),
)(CreateIncident);
