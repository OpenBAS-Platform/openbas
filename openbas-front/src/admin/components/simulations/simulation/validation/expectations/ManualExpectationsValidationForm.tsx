import React, { FunctionComponent } from 'react';
import { Button, Chip, TextField as MuiTextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { makeStyles } from '@mui/styles';
import type { InjectExpectationsStore } from '../../../../common/injects/expectations/Expectation';
import { useFormatter } from '../../../../../../components/i18n';
import { updateInjectExpectation } from '../../../../../../actions/Exercise';
import { useAppDispatch } from '../../../../../../utils/hooks';
import type { Theme } from '../../../../../../components/Theme';
import colorStyles from '../../../../../../components/Color';
import { zodImplement } from '../../../../../../utils/Zod';

const useStyles = makeStyles((theme: Theme) => ({
  marginTop_2: {
    marginTop: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
    placeContent: 'end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  chipInList: {
    height: 30,
    borderRadius: 4,
    textTransform: 'uppercase',
    width: 150,
    float: 'right',
  },
}));

interface FormProps {
  expectation: InjectExpectationsStore;
  onUpdate?: () => void;
}

const ManualExpectationsValidationForm: FunctionComponent<FormProps> = ({ expectation, onUpdate }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const computeLabel = (e: InjectExpectationsStore) => {
    if (e.inject_expectation_status === 'PENDING') {
      return t('Pending validation');
    }
    if (e.inject_expectation_status === 'SUCCESS') {
      return t('Success');
    }
    if (e.inject_expectation_status === 'PARTIAL') {
      return t('Partial');
    }
    return t('Failed');
  };
  const computeColorStyle = (e: InjectExpectationsStore) => {
    if (e.inject_expectation_status === 'PENDING') {
      return colorStyles.blueGrey;
    }
    if (e.inject_expectation_status === 'SUCCESS') {
      return colorStyles.green;
    }
    if (e.inject_expectation_status === 'PARTIAL') {
      return colorStyles.orange;
    }
    return colorStyles.red;
  };
  const onSubmit = (data: { expectation_score: number }) => {
    dispatch(updateInjectExpectation(expectation.inject_expectation_id, { ...data, source_id: 'ui', source_type: 'ui', source_name: 'User input' })).then(() => {
      onUpdate?.();
    });
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ expectation_score: number }>({
    mode: 'onTouched',
    resolver: zodResolver(zodImplement<{ expectation_score: number }>().with({
      expectation_score: z.coerce.number(),
    })),
    defaultValues: {
      expectation_score: expectation.inject_expectation_score ?? expectation.inject_expectation_expected_score ?? 0,
    },
  });

  return (
    <div style={{ marginTop: 10 }}>
      <form id="expectationForm" onSubmit={handleSubmit(onSubmit)}>
        <Chip
          classes={{ root: classes.chipInList }}
          style={computeColorStyle(expectation)}
          label={computeLabel(expectation)}
        />
        <Typography variant="h3">{expectation.inject_expectation_user ? t('Player') : t('Team')}</Typography>
        {expectation.inject_expectation_user ? expectation.inject_expectation_user : expectation.inject_expectation_team}
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
    </div>
  );
};

export default ManualExpectationsValidationForm;
