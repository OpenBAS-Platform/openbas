import { Step, StepLabel, Stepper } from '@mui/material';
import type { FunctionComponent } from 'react';

const StepperComponent: FunctionComponent<{
  steps: string[];
  activeStep: number;
  handlePrevious: (index: number) => void;
}> = ({ steps, activeStep, handlePrevious }) => {
  return (
    <Stepper activeStep={activeStep}>
      {steps.map((label, index) => {
        return (
          <Step key={label}>
            <StepLabel
              style={{ cursor: index < activeStep ? 'pointer' : 'default' }}
              onClick={() => handlePrevious(index)}
            >
              {label}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default StepperComponent;
