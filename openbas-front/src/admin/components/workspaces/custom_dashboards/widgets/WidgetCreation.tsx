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
import WidgetCreationParameters from './WidgetCreationParameters';
import WidgetCreationSeriesList from './WidgetCreationSeriesList';
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
    widget_config: {
      mode: 'structural',
      title: '',
      field: '',
      series: [{ name: '' }],
    },
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  // Dialog
  const [open, setOpen] = useState(false);
  const toggleDialog = () => setOpen(prev => !prev);

  // Stepper
  const [activeStep, setActiveStep] = useState(0);
  const nextStep = () => setActiveStep(prevActiveStep => prevActiveStep + 1);
  const goToStep = (step: number) => step <= activeStep && setActiveStep(step);
  const isLastStep = () => activeStep === steps.length - 1;

  // Form
  const widgetConfigSchema = z.discriminatedUnion('mode', [
    z.object({
      mode: z.literal('temporal'),
      title: z.string().optional(),
      field: z.string().min(1, { message: t('Should not be empty') }),
      start: z.string().min(1, { message: t('Should not be empty') }),
      end: z.string().min(1, { message: t('Should not be empty') }),
      interval: z.enum(['year', 'month', 'week', 'day', 'hour', 'quarter']).optional(),
      stacked: z.boolean().optional(),
      display_legend: z.boolean().optional(),
      series: z.array(z.object({
        name: z.string().optional(),
        filter: z.any().optional(),
      })),
    }),
    z.object({
      mode: z.literal('structural'),
      title: z.string().optional(),
      field: z.string().min(1, { message: t('Should not be empty') }),
      stacked: z.boolean().optional(),
      display_legend: z.boolean().optional(),
      series: z.array(z.object({
        name: z.string().optional(),
        filter: z.any().optional(),
      })),
    }),
  ]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm<WidgetInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<WidgetInput>().with({
        widget_type: z.enum(['vertical-barchart']),
        widget_config: widgetConfigSchema,
      }),
    ),
    defaultValues: initialValues,
  });

  const widgetType = watch('widget_type');

  const onCancel = () => {
    reset(initialValues);
    setActiveStep(0);
  };

  const onSubmit = async (input: WidgetInput) => {
    await createCustomDashboardWidget(customDashboardId, input);
    toggleDialog();
    reset(initialValues);
    setActiveStep(0);
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
              onCancel={onCancel}
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
                name="widget_config.series"
                render={({ field: { value, onChange } }) => (
                  <WidgetCreationSeriesList
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
                name="widget_config"
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
