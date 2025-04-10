import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mui/material';
import { type FunctionComponent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import Dialog from '../../../../../components/common/Dialog';
import StepperComponent from '../../../../../components/common/StepperComponent';
import { useFormatter } from '../../../../../components/i18n';
import { zodImplement } from '../../../../../utils/Zod';
import WidgetCreationParameters from './WidgetCreationParameters';
import WidgetCreationSecurityCoverageSeries from './WidgetCreationSecurityCoverageSeries';
import WidgetCreationSeriesList from './WidgetCreationSeriesList';
import WidgetCreationTypes from './WidgetCreationTypes';
import { getAvailableSteps, steps, type WidgetInputWithoutLayout } from './WidgetUtils';

const ActionsComponent: FunctionComponent<{
  disabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  editing: boolean;
}> = ({ disabled, onCancel, onSubmit, editing }) => {
  // Standard hooks
  const { t } = useFormatter();

  return (
    <>
      <Button onClick={onCancel}>{t('Cancel')}</Button>
      <Button color="secondary" onClick={onSubmit} disabled={disabled}>
        {editing ? t('Update') : t('Create')}
      </Button>
    </>
  );
};

interface Props {
  open: boolean;
  toggleDialog: () => void;
  initialValues?: WidgetInputWithoutLayout;
  onSubmit: (input: WidgetInputWithoutLayout) => Promise<void>;
  editing?: boolean;
}

const WidgetForm: FunctionComponent<Props> = ({
  open,
  toggleDialog,
  initialValues = {
    widget_type: undefined,
    widget_config: {
      mode: undefined,
      title: '',
      field: '',
      series: [{ name: '' }],
    },
  },
  onSubmit,
  editing = false,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  // Form
  const widgetConfigSchema = z.discriminatedUnion('mode', [
    z.object({
      mode: z.literal('temporal'),
      title: z.string().optional(),
      field: z.string().min(1, { message: t('Should not be empty') }),
      start: z.string().min(1, { message: t('Should not be empty') }),
      end: z.string().min(1, { message: t('Should not be empty') }),
      interval: z.enum(['year', 'month', 'week', 'day', 'hour', 'quarter']),
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
    setValue,
  } = useForm<WidgetInputWithoutLayout>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<WidgetInputWithoutLayout>().with({
        widget_type: z.enum(['vertical-barchart', 'security-coverage', 'line']),
        widget_config: widgetConfigSchema,
      }),
    ),
    defaultValues: initialValues,
  });

  const widgetType = watch('widget_type');

  // Stepper
  const availableSteps = getAvailableSteps(widgetType);
  const [activeStep, setActiveStep] = useState(editing ? 2 : 0);
  const nextStep = () => {
    for (let i = activeStep + 1; i < steps.length; i++) {
      if (availableSteps.includes(steps[i])) {
        setActiveStep(i);
        break;
      }
    }
  };
  const goToStep = (step: number) => {
    if (step > activeStep) return;

    if (step === 0) {
      reset(initialValues);
    }

    for (let i = step; i >= 0; i--) {
      if (availableSteps.includes(steps[i])) {
        setActiveStep(i);
        break;
      }
    }
  };

  const isLastStep = () => activeStep === steps.length - 1;

  const onCancel = () => {
    reset(initialValues);
    setActiveStep(0);
    toggleDialog();
  };

  const handleSubmitWithoutPropagation = () => {
    handleSubmit((values) => {
      onSubmit(values);
      toggleDialog();
    })();
  };

  return (
    <form id="widgetCreationForm">
      <Dialog
        className="noDrag"
        open={open}
        handleClose={toggleDialog}
        title={<StepperComponent widgetType={widgetType} steps={steps} activeStep={activeStep} handlePrevious={goToStep} />}
        actions={(
          <ActionsComponent
            disabled={!isLastStep()}
            onCancel={onCancel}
            onSubmit={handleSubmitWithoutPropagation}
            editing={editing}
          />
        )}
      >
        <>
          {activeStep === 0 && (
            <Controller
              control={control}
              name="widget_type"
              render={({ field: { value, onChange } }) => (
                <WidgetCreationTypes
                  value={value}
                  onChange={(type) => {
                    onChange(type);
                    nextStep();
                  }}
                />
              )}
            />
          )}
          {activeStep === 1
            && (widgetType === 'security-coverage'
              ? (
                  <Controller
                    control={control}
                    name="widget_config.series"
                    render={({ field: { value, onChange } }) => (
                      <WidgetCreationSecurityCoverageSeries
                        value={value}
                        onChange={onChange}
                        onSubmit={nextStep}
                      />
                    )}
                  />
                )
              : (
                  <Controller
                    control={control}
                    name="widget_config.series"
                    render={({ field: { value, onChange } }) => (
                      <WidgetCreationSeriesList
                        widgetType={widgetType}
                        currentSeries={value}
                        onChange={onChange}
                        onSubmit={nextStep}
                      />
                    )}
                  />
                )
            )}
          {activeStep === 2 && (
            <WidgetCreationParameters
              widgetType={widgetType}
              control={control}
              setValue={setValue}
            />
          )}
        </>
      </Dialog>
    </form>
  );
};

export default WidgetForm;
