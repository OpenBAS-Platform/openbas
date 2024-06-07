import React, { Component } from 'react';
import { Button, FormControlLabel, Switch } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ExerciseUpdateStartDateInput } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { emptyFilterGroup } from '../../../../components/common/filter/FilterUtils';
import AssetGroupForm from '../../assets/asset_groups/AssetGroupForm';
import { zodImplement } from '../../../../utils/Zod';

interface Props {
  onSubmit: SubmitHandler<ExerciseUpdateStartDateInput>;
  initialValues?: ExerciseUpdateStartDateInput;
  editing?: boolean;
  handleClose: () => void;
}

const ExerciseDateForm: React.FC<Props> = ({
  onSubmit,
  handleClose,
  editing,
  initialValues,
}) => {
  const { t } = useFormatter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, isValid },
  } = useForm<ExerciseUpdateStartDateInput>({
    mode: 'onTouched',
    /* resolver: zodResolver(
      zodImplement<AssetGroupInput>().with({
        asset_group_name: z.string().min(1, { message: t('Should not be empty') }),
        asset_group_description: z.string().optional(),
        asset_group_tags: z.string().array().optional(),
        asset_group_dynamic_filter: z.any().optional(),
      }),
    ), */
    defaultValues: initialValues,
  });

  const handleChange = () => {
    console.log('switched');
  };

  return (
    <form id="exerciseDateForm" onSubmit={handleSubmit(onSubmit)}>
      {/* <DateTimePicker
              name="exercise_start_date"
              label={t('Start date (optional)')}
              autoOk={true}
              minDateTime={new Date()}
              textFieldProps={{ variant: 'standard', fullWidth: true }}
            /> */}
      <FormControlLabel control={<Switch onChange={handleChange} />} label="Manual launch" />

      <DatePicker
        views={['year', 'month', 'day']}
        label={t('Start date (optional)')}
        name="date"
        minDate={new Date()}
        slotProps={{
          textField: {
            fullWidth: true,
            /* error: !!fieldState.error,
            helperText: fieldState.error && fieldState.error?.message, */
          },
        }}
      />

      <TimePicker
        label={t('Scheduling_time')}
        name="time"
        openTo="hours"
        timeSteps={{ minutes: 15 }}
        skipDisabled
        thresholdToRenderTimeInASingleColumn={100}
      />
      <div style={{ float: 'right', marginTop: 20 }}>
        {handleClose && (
          <Button
            onClick={handleClose.bind(this)}
            style={{ marginRight: 10 }}
          >
            {t('Cancel')}
          </Button>
        )}
        <Button
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {editing ? t('Update') : t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseDateForm;

/*
  extends Component {
  render() {
    const { t, onSubmit, initialValues, editing, handleClose } = this.props;
    const handleChange = () => {
      console.log('switched');
    };
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ handleSubmit, submitting, pristine }) => (
          <form id="exerciseDateForm" onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 2 }}>
              <DateTimePicker
              name="exercise_start_date"
              label={t('Start date (optional)')}
              autoOk={true}
              minDateTime={new Date()}
              textFieldProps={{ variant: 'standard', fullWidth: true }}
            />
              <FormControlLabel control={<Switch onChange={handleChange} />} label="Manual launch" />

              <DatePicker
                views={['year', 'month', 'day']}
                label={t('Start date (optional)')}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth:
                  },
                }}
              />

              <TimePicker
                label={t('Scheduling_time')}
                openTo="hours"
                timeSteps={{ minutes: 15 }}
                skipDisabled
                thresholdToRenderTimeInASingleColumn={100}
              />
            </Stack>
            <div style={{ float: 'right', marginTop: 20 }}>
              {handleClose && (
                <Button
                  onClick={handleClose.bind(this)}
                  style={{ marginRight: 10 }}
                >
                  {t('Cancel')}
                </Button>
              )}
              <Button
                color="secondary"
                type="submit"
                disabled={pristine || submitting}
              >
                {editing ? t('Update') : t('Create')}
              </Button>
            </div>

          </form>
        )}
      </Form>
    );
  }
}

ExerciseDateForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(ExerciseDateForm);
*/
