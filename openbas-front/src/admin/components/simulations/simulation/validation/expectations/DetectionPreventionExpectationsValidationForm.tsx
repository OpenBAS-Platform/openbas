import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid, TextField as MuiTextField, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { type FunctionComponent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';
import { z } from 'zod';

import { type SecurityPlatformHelper } from '../../../../../../actions/assets/asset-helper';
import { fetchSecurityPlatforms } from '../../../../../../actions/assets/securityPlatform-actions';
import { createExpectationTrace } from '../../../../../../actions/atomic_testings/atomic-testing-actions';
import { updateInjectExpectation } from '../../../../../../actions/Exercise';
import ExpandableText from '../../../../../../components/common/ExpendableText';
import SecurityPlatformField from '../../../../../../components/fields/SecurityPlatformField';
import { useFormatter } from '../../../../../../components/i18n';
import ItemResult from '../../../../../../components/ItemResult';
import { useHelper } from '../../../../../../store';
import { type InjectExpectationResult, type SecurityPlatform } from '../../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../../utils/hooks';
import useDataLoader from '../../../../../../utils/hooks/useDataLoader';
import { zodImplement } from '../../../../../../utils/Zod';
import { type InjectExpectationsStore } from '../../../../common/injects/expectations/Expectation';

const useStyles = makeStyles()(theme => ({
  marginTop_2: { marginTop: theme.spacing(2) },
  buttons: {
    display: 'flex',
    placeContent: 'end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

interface FormProps {
  expectation: InjectExpectationsStore;
  result?: InjectExpectationResult;
  agentId: string | undefined;
  sourceIds?: string[];
  onUpdate?: () => void;
}

const DetectionPreventionExpectationsValidationForm: FunctionComponent<FormProps> = ({ expectation, result, sourceIds = [], agentId, onUpdate }) => {
  const { classes } = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { securityPlatformsMap }: { securityPlatformsMap: Record<string, SecurityPlatform> }
    = useHelper((helper: SecurityPlatformHelper) => ({ securityPlatformsMap: helper.getSecurityPlatformsMap() }));
  useDataLoader(() => {
    dispatch(fetchSecurityPlatforms());
  });
  const onSubmit = (data: {
    expectation_score: number;
    security_platform: string;
    inject_expectation_trace_expectation: string;
    inject_expectation_trace_alert_name: string;
    inject_expectation_trace_alert_link: string;
    inject_expectation_trace_date: string;
  }) => {
    dispatch(updateInjectExpectation(expectation.inject_expectation_id, {
      ...data,
      source_id: data.security_platform,
      source_type: 'security-platform',
      source_name: securityPlatformsMap[data.security_platform].asset_name,
    })).then(() => {
      onUpdate?.();
    });
    if (agentId) {
      createExpectationTrace({
        ...data,
        inject_expectation_trace_expectation: expectation.inject_expectation_id,
        inject_expectation_trace_collector: data.security_platform,
        inject_expectation_trace_alert_name: data.inject_expectation_trace_alert_name,
        inject_expectation_trace_alert_link: data.inject_expectation_trace_alert_link,
        inject_expectation_trace_date: data.inject_expectation_trace_date,
      }).then(() => {
        onUpdate?.();
      });
    }
  };
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{
    expectation_score: number;
    security_platform: string;
    inject_expectation_trace_expectation: string;
    inject_expectation_trace_alert_name: string;
    inject_expectation_trace_alert_link: string;
    inject_expectation_trace_date: string;
  }>({
    mode: 'onTouched',
    resolver: zodResolver(zodImplement<{
      expectation_score: number;
      security_platform: string;
      inject_expectation_trace_expectation: string | undefined;
      inject_expectation_trace_alert_name: string | undefined;
      inject_expectation_trace_alert_link: string | undefined;
      inject_expectation_trace_date: string | undefined;
    }>().with({
      expectation_score: z.coerce.number(),
      security_platform: z.string().min(1, { message: t('Should not be empty') }),
      inject_expectation_trace_expectation: z.string().optional(),
      inject_expectation_trace_alert_name: z.string().optional(),
      inject_expectation_trace_alert_link: z.string().optional(),
      inject_expectation_trace_date: z.string().optional(),
    })),
    defaultValues: {
      expectation_score: result?.score ?? expectation.inject_expectation_expected_score ?? 0,
      security_platform: result?.sourceId ?? '',
    },
  });

  // Security Platform Options
  const filterOptions = (n: SecurityPlatform) => (n.asset_external_reference === null && !sourceIds.includes(n.asset_id));

  return (
    <form id="expectationForm" onSubmit={handleSubmit(onSubmit)}>
      {result && (
        <div style={{ float: 'right' }}>
          <ItemResult label={result?.result} status={result?.result} />
        </div>
      )}
      <Typography variant="h3">{t('Name')}</Typography>
      {expectation.inject_expectation_name}
      <div className={classes.marginTop_2}>
        <Typography variant="h3">{t('Description')}</Typography>
        <ExpandableText source={expectation.inject_expectation_description} limit={120} />
      </div>
      <Controller
        control={control}
        name="security_platform"
        render={({ field: { onChange, value } }) => (
          <SecurityPlatformField
            name="security_platform"
            label={t('Security platform')}
            fieldValue={value ?? ''}
            fieldOnChange={onChange}
            errors={errors}
            filterOptions={filterOptions}
            style={{ marginTop: 20 }}
            editing={!!result}
          />
        )}
      />
      <MuiTextField
        className={classes.marginTop_2}
        variant="standard"
        fullWidth
        label={t('Score')}
        type="number"
        error={!!errors.expectation_score}
        helperText={errors.expectation_score && errors.expectation_score?.message ? errors.expectation_score?.message : `${t('Expected score:')} ${expectation.inject_expectation_expected_score}`}
        inputProps={register('expectation_score')}
      />
      {
        agentId && (
          <Grid container={true} spacing={2}>
            <Grid item={true} xs={4}>
              <MuiTextField
                className={classes.marginTop_2}
                variant="standard"
                fullWidth
                label={t('Alert name')}
                inputProps={register('inject_expectation_trace_alert_name')}
              />
            </Grid>
            <Grid item={true} xs={4}>
              <MuiTextField
                className={classes.marginTop_2}
                variant="standard"
                fullWidth
                label={t('Alert Link')}
                inputProps={register('inject_expectation_trace_alert_link')}
              />
            </Grid>
            <Grid item={true} xs={4}>
              <Controller
                control={control}
                name="inject_expectation_trace_date"
                render={({ field, fieldState }) => (
                  <DateTimePicker
                    className={classes.marginTop_2}
                    value={field.value ? new Date(field.value) : null}
                    onChange={startDate => field.onChange(startDate?.toISOString())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                    label={`${expectation.inject_expectation_type} ${t('time')}`}
                  />
                )}
              />
            </Grid>
          </Grid>
        )
      }

      <div className={classes.buttons}>
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="contained"
        >
          {t('Validate')}
        </Button>
      </div>
    </form>
  );
};

export default DetectionPreventionExpectationsValidationForm;
