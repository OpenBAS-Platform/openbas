import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Step, StepLabel, Stepper } from '@mui/material';
import { type FunctionComponent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createCustomDashboardWidget } from '../../../../../actions/custom_dashboards/customdashboardwidget-action';
import ButtonCreate from '../../../../../components/common/ButtonCreate';
import Dialog from '../../../../../components/common/Dialog';
import { useFormatter } from '../../../../../components/i18n';
import { type WidgetInput } from '../../../../../utils/api-types';
import { zodImplement } from '../../../../../utils/Zod';
import WidgetCreationDataSelections from './WidgetCreationDataSelections';
import WidgetCreationParameters from './WidgetCreationParameters';
import WidgetCreationTypes from './WidgetCreationTypes';

const steps = ['Visualization', 'Filters', 'Parameters'];

const StepperComponent: FunctionComponent<{
  activeStep: number;
  handlePrevious: (index: number) => void;
}> = ({ activeStep, handlePrevious }) => {
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

const ActionsComponent: FunctionComponent<{
  disabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}> = ({ disabled, onCancel, onSubmit }) => {
  // Standard hooks
  const { t } = useFormatter();

  return (
    <>
      <Button onClick={onCancel}>{t('Cancel')}</Button>
      <Button color="secondary" onClick={onSubmit} disabled={disabled}>
        {t('Create')}
      </Button>
    </>
  );
};

const WidgetCreation: FunctionComponent<{
  customDashboardId: string;
  initialValues?: WidgetInput;
}> = ({
  customDashboardId,
  initialValues = {
    widget_type: 'vertical-barchart',
    widget_data_selections: [{ widget_data_selection_label: '' }],
    widget_parameters: {
      widget_parameters_title: '',
      widget_parameters_mode: 'structure',
      widget_parameters_stacked: false,
      widget_parameters_display_legend: false,
    },
  },
}) => {
  // Dialog
  const [open, setOpen] = useState(false);
  const toggleDialog = () => setOpen(prev => !prev);

  // Stepper
  const [activeStep, setActiveStep] = useState(0);
  const nextStep = () => setActiveStep(prevActiveStep => prevActiveStep + 1);
  const goToStep = (step: number) => step <= activeStep && setActiveStep(step);
  const isLastStep = () => activeStep === steps.length - 1;

  // Form
  const {
    control,
    handleSubmit,
    watch,
  } = useForm<WidgetInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<WidgetInput>().with({
        widget_type: z.enum(['vertical-barchart']),
        widget_data_selections: z.array(z.object({
          widget_data_selection_label: z.string().optional(),
          widget_data_selection_filter: z.any().optional(),
        })),
        widget_parameters: z.object({ widget_parameters_title: z.string().optional() }),
      }),
    ),
    defaultValues: initialValues,
  });

  const widgetType = watch('widget_type');

  const onSubmit = async (input: WidgetInput) => {
    await createCustomDashboardWidget(customDashboardId, input);
  };
  const handleSubmitWithoutPropagation = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <>
      <ButtonCreate onClick={toggleDialog} />
      <form id="widgetCreationForm">
        <Dialog
          open={open}
          handleClose={toggleDialog}
          title={<StepperComponent activeStep={activeStep} handlePrevious={goToStep} />}
          actions={(
            <ActionsComponent
              disabled={!isLastStep()}
              onCancel={toggleDialog}
              onSubmit={handleSubmitWithoutPropagation}
            />
          )}
        >
          <>
            {activeStep === 0 && (
              <Controller
                control={control}
                name="widget_type"
                render={({ field: { onChange } }) => (
                  <WidgetCreationTypes onChange={(type) => {
                    onChange(type);
                    nextStep();
                  }}
                  />
                )}
              />
            )}
            {activeStep === 1 && (
              <Controller
                control={control}
                name="widget_data_selections"
                render={({ field: { value, onChange } }) => (
                  <WidgetCreationDataSelections
                    widgetType={widgetType}
                    value={value}
                    onChange={onChange}
                    onSubmit={nextStep}
                  />
                )}
              />
            )}
            {activeStep === 2 && (
              <Controller
                control={control}
                name="widget_parameters"
                render={() => <WidgetCreationParameters control={control} />}
              />
            )}
          </>
        </Dialog>
      </form>
    </>
  );
};

export default WidgetCreation;
