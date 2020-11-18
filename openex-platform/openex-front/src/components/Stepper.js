import React from 'react';
import PropTypes from 'prop-types';
import MUIStep from '@material-ui/core/Stepper';
import MUIStepButton from '@material-ui/core/StepButton';
import MUIStepLabel from '@material-ui/core/StepLabel';

export const Step = (props) => (
  <MUIStep
    active={props.active}
    completed={props.completed}
    disabled={props.disabled}
  >
    {props.children}
  </MUIStep>
);

Step.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
};

export const Stepper = (props) => (
  <MUIStepper
    activeStep={props.activeStep}
    linear={props.linear}
    orientation={props.orientation}
  >
    {props.children}
  </MUIStepper>
);

Stepper.propTypes = {
  activeStep: PropTypes.number,
  linear: PropTypes.bool,
  orientation: PropTypes.string,
  children: PropTypes.node,
};

export const StepButton = (props) => (
  <MUIStepButton
    active={props.active}
    completed={props.completed}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.children}
  </MUIStepButton>
);

StepButton.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

export const StepLabel = (props) => (
  <MUIStepLabel
    active={props.active}
    completed={props.completed}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.children}
  </MUIStepLabel>
);

StepLabel.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};
