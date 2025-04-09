import { Step, StepLabel, Stepper } from '@mui/material';
import type { FunctionComponent } from 'react';

import { getAvailableSteps, type StepType } from '../../admin/components/workspaces/custom_dashboards/widgets/WidgetUtils';
import type { Widget } from '../../utils/api-types';

const StepperComponent: FunctionComponent<{
  widgetType: Widget['widget_type'];
  steps: StepType[];
  activeStep: number;
  handlePrevious: (index: number) => void;
}> = ({ widgetType, steps, activeStep, handlePrevious }) => {
  const availableSteps = getAvailableSteps(widgetType);

  return (
    <Stepper activeStep={activeStep}>
      {steps.map((label, index) => {
        const isEnabled = availableSteps.includes(label);
        return (
          <Step
            key={label}
            disabled={!isEnabled}
          >
            <StepLabel
              onClick={isEnabled ? () => handlePrevious(index) : undefined}
              sx={{
                cursor: isEnabled && index < activeStep ? 'pointer' : 'default',
                opacity: isEnabled ? 1 : 0.5,
              }}
            >
              {label}
              {isEnabled && index < activeStep}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default StepperComponent;
