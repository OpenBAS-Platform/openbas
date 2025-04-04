import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mui/material';
import { type FunctionComponent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import Dialog from '../../../../../components/common/Dialog';
import StepperComponent from '../../../../../components/common/StepperComponent';
import { useFormatter } from '../../../../../components/i18n';
import { type WidgetInput } from '../../../../../utils/api-types';
import { zodImplement } from '../../../../../utils/Zod';
import WidgetCreationParameters from './WidgetCreationParameters';
import WidgetCreationPerspectives from './WidgetCreationPerspectives';
import WidgetCreationSeriesList from './WidgetCreationSeriesList';
import WidgetCreationTypes from './WidgetCreationTypes';
import type { StepType } from './WidgetUtils';

const steps: StepType[] = ['Visualization', 'Perspective', 'Filters', 'Parameters'];

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
  initialValues?: WidgetInput;
  onSubmit: (input: WidgetInput) => Promise<void>;
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

  // Stepper
  const [activeStep, setActiveStep] = useState(editing ? 2 : 0);
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
  } = useForm<WidgetInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<WidgetInput>().with({
        widget_type: z.enum(['vertical-barchart', 'security-coverage']),
        widget_config: widgetConfigSchema,
      }),
    ),
    defaultValues: initialValues,
  });

  const widgetType = watch('widget_type');

  const onCancel = () => {
    reset(initialValues);
    setActiveStep(0);
    toggleDialog();
  };

  const handleSubmitWithoutPropagation = () => {
    handleSubmit(onSubmit)();
    toggleDialog();
    reset(initialValues);
    setActiveStep(0);
  };

  return (
    <form id="widgetCreationForm">
      <Dialog
        open={open}
        handleClose={toggleDialog}
        title={<StepperComponent steps={steps} activeStep={activeStep} handlePrevious={goToStep} />}
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
          {activeStep === 1 && (
            <Controller
              control={control}
              name="widget_config.series"
              render={({ field: { value, onChange } }) => (
                <WidgetCreationPerspectives
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
          )}
          {activeStep === 3 && (
            <Controller
              control={control}
              name="widget_config"
              render={() => (
                <WidgetCreationParameters
                  widgetType={widgetType}
                  control={control}
                  setValue={setValue}
                />
              )}
            />
          )}
        </>
      </Dialog>
    </form>
  );
};

export default WidgetForm;
