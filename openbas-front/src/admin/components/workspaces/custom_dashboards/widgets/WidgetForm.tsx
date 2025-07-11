import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mui/material';
import { type FunctionComponent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import Dialog from '../../../../../components/common/Dialog';
import StepperComponent from '../../../../../components/common/StepperComponent';
import { useFormatter } from '../../../../../components/i18n';
import { type Widget } from '../../../../../utils/api-types-custom';
import { zodImplement } from '../../../../../utils/Zod';
import WidgetCreationParameters from './WidgetCreationParameters';
import WidgetCreationSecurityCoverageSeries from './WidgetCreationSecurityCoverageSeries';
import WidgetCreationSeriesList from './WidgetCreationSeriesList';
import WidgetCreationTypes from './WidgetCreationTypes';
import { getAvailableSteps, lastStepIndex, steps, type WidgetInputWithoutLayout } from './WidgetUtils';
import WidgetCreationPerspective from "./WidgetCreationPerspective";

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
  const widgetConfigSchema = z.discriminatedUnion('widget_configuration_type', [
    z.object({
      mode: z.literal('temporal'),
      title: z.string().optional(),
      field: z.string().min(1, { message: t('Should not be empty') }),
      start: z.string().min(1, { message: t('Should not be empty') }),
      end: z.string().min(1, { message: t('Should not be empty') }),
      interval: z.enum(['year', 'month', 'week', 'day', 'hour', 'quarter']),
      widget_configuration_type: z.literal('temporal-histogram'),
      stacked: z.boolean().optional(),
      display_legend: z.boolean().optional(),
      series: z.array(z.object({
        name: z.string().optional(),
        filter: z.any().refine(val => val !== undefined, { message: 'Filter cannot be undefined' }),
      })),
    }),
    z.object({
      mode: z.literal('structural'),
      title: z.string().optional(),
      field: z.string().min(1, { message: t('Should not be empty') }),
      stacked: z.boolean().optional(),
      display_legend: z.boolean().optional(),
      limit: z.number()
        .min(1, { message: t('Minimum value is 1') })
        .max(100, { message: t('Maximum value is 100') })
        .optional(),
      widget_configuration_type: z.literal('structural-histogram'),
      series: z.array(z.object({
        name: z.string().optional(),
        filter: z.any().refine(val => val !== undefined, { message: 'Filter cannot be undefined' }),
      })),
    }),
    z.object({
      title: z.string().optional(),
      widget_configuration_type: z.literal('list'),
      sorts: z.array(z.object({
        direction: z.literal('ASC').or(z.literal('DESC')),
        fieldName: z.string(),
      })).optional(),
      limit: z.number()
        .min(1, { message: t('Minimum value is 1') })
        .max(1000, { message: t('Maximum value is 1000') })
        .optional(),
      columns: z.array(z.string()),
      perspective: z.object({
        name: z.string().optional(),
        filter: z.any().refine(val => val !== undefined, { message: 'Filter cannot be undefined' }),
      }),
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
        widget_type: z.enum(['vertical-barchart', 'horizontal-barchart', 'security-coverage', 'line', 'donut', 'list', 'attack-path']),
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

  const onClose = () => {
    setActiveStep(editing ? lastStepIndex : 0);
    toggleDialog();
  };

  const onCancel = () => {
    reset(initialValues);
    setActiveStep(0);
    onClose();
  };

  const handleSubmitWithoutPropagation = async () => {
    handleSubmit((values) => {
      onSubmit(values);
      onClose();
    })();
  };

  const getSeriesComponent = (widgetType: Widget['widget_type']) => {
    switch (widgetType) {
      case 'attack-path':
      case 'security-coverage': return (
        <Controller
          control={control}
          name="widget_config.series"
          render={({ field: { value, onChange } }) => (
            <WidgetCreationSecurityCoverageSeries
              value={value}
              onChange={onChange}
              onSubmit={nextStep}
              isSimulationFilterMandatory={widgetType === 'attack-path'}
            />
          )}
        />
      );
      case 'list': return (
        <Controller
            control={control}
            name="widget_config.perspective"
            render={({ field: { value, onChange } }) => (
                        <WidgetCreationPerspective
                            index={0}
                            perspective={value}
                            onChange={onChange}
                            onSubmit={nextStep}
                        />

                    )}
                    />
      );
      default: return (
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
      );
    }
  };

  return (
    <form id="widgetCreationForm">
      <Dialog
        className="noDrag"
        open={open}
        handleClose={onClose}
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
            && getSeriesComponent(widgetType)}
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
