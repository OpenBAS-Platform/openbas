import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import * as Constants from '../../../../../constants/ComponentTypes';
import { DialogTitleElement } from '../../../../../components/Dialog';
import { FlatButton, ActionButtonCreate } from '../../../../../components/Button';
import { Step, Stepper, StepLabel } from '../../../../../components/Stepper';
import AppBar from '../../../../../components/AppBar';
import IncidentForm from './IncidentForm';
import IncidentSubobjectives from './IncidentSubobjectives';
// eslint-disable-next-line import/no-cycle
import { addIncident, selectIncident } from '../../../../../actions/Incident';

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Subobjectives': '2. Sous-objectifs',
    Incidents: 'Incidents',
    'Create a new incident': 'Créer un nouvel incident',
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
    this.setState({ incidentData: data });
  }

  onSubobjectivesChange(data) {
    const { incidentData } = this.state;
    incidentData.incident_subobjectives = data;
    this.setState({ incidentData });
  }

  handleNext() {
    if (this.state.stepIndex === 0) {
      this.refs.incidentForm.submit();
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
            ref="incidentForm"
            onSubmit={this.onGlobalSubmit.bind(this)}
            onSubmitSuccess={this.selectSubobjectives.bind(this)}
            types={this.props.incident_types}
          />
        );
      case 1:
        return (
          <IncidentSubobjectives
            ref="incidentSubobjectives"
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
    const actions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseCreate.bind(this)}
      />,
      <FlatButton
        key="create"
        label={this.state.stepIndex === 1 ? 'Create' : 'Next'}
        primary={true}
        onClick={this.handleNext.bind(this)}
      />,
    ];

    return (
      <div>
        {this.props.can_create ? (
          <AppBar
            title={<T>Incidents</T>}
            showMenuIconButton={false}
            iconElementRight={
              <ActionButtonCreate
                type={Constants.BUTTON_TYPE_CREATE_RIGHT}
                onClick={this.handleOpenCreate.bind(this)}
              />
            }
          />
        ) : (
          <AppBar title={<T>Incidents</T>} showMenuIconButton={false} />
        )}

        <DialogTitleElement
          title={
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
          }
          modal={false}
          open={this.state.openCreate}
          onRequestClose={this.handleCloseCreate.bind(this)}
          autoScrollBodyContent={true}
          actions={actions}
        >
          <div>{this.getStepContent(this.state.stepIndex)}</div>
        </DialogTitleElement>
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

export default connect(null, { addIncident, selectIncident })(CreateIncident);
