import React, { FunctionComponent, useState } from 'react';
import { Typography, Alert, Button, TextField as MuiTextField, Chip } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import type { InjectExpectationsStore } from '../../../components/injects/expectations/Expectation';
import { useFormatter } from '../../../../../components/i18n';
import { updateInjectExpectation } from '../../../../../actions/Exercise';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { Inject } from '../../../../../utils/api-types';
import ExpandableText from '../../../../../components/common/ExpendableText';
import Drawer from '../../../../../components/common/Drawer';
import type { Theme } from '../../../../../components/Theme';
import colorStyles from '../../../../../components/Color';
import { zodImplement } from '../../../../../utils/Zod';

const useStyles = makeStyles((theme: Theme) => ({
  marginTop_2: {
    marginTop: theme.spacing(2),
  },
  marginBottom_2: {
    marginBottom: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
    placeContent: 'end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  message: {
    width: '100%',
  },
  chipInList: {
    height: 20,
    borderRadius: '0',
    textTransform: 'uppercase',
    width: 200,
    float: 'right',
  },
}));

interface FormProps {
  exerciseId: string;
  expectation: InjectExpectationsStore;
}

const ManualExpectationsValidationForm: FunctionComponent<FormProps> = ({
  exerciseId,
  expectation,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const isValid = (e: InjectExpectationsStore) => {
    return !R.isEmpty(e.inject_expectation_results);
  };

  const [validated, setValidated] = useState(isValid(expectation));
  const [label, setLabel] = useState(isValid(expectation) ? t('Validated') : t('Pending validation'));

  const onSubmit = (data: { expectation_score: number }) => {
    dispatch(
      updateInjectExpectation(exerciseId, expectation.inject_expectation_id, data),
    ).then((e: InjectExpectationsStore) => {
      setValidated(isValid(e));
      setLabel(isValid(e) ? t('Validated') : t('Pending validation'));
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
      expectation_score: (expectation.inject_expectation_score || expectation.inject_expectation_expected_score) ?? 0,
    },
  });

  return (
    <form id="expectationForm" onSubmit={handleSubmit(onSubmit)}>
      <Alert
        classes={{ message: classes.message }}
        severity="info"
        icon={false}
        variant="outlined"
        className={classes.marginBottom_2}
      >
        <Chip
          classes={{ root: classes.chipInList }}
          style={
            validated
              ? colorStyles.green
              : colorStyles.orange
          }
          label={label}
        />
        <Typography variant="h3">{t('Name')}</Typography>
        {expectation.inject_expectation_name}
        {expectation.inject_expectation_description
          && <div className={classes.marginTop_2}>
            <Typography variant="h3">{t('Description')}</Typography>
            <ExpandableText source={expectation.inject_expectation_description} limit={120} />
          </div>
        }
        <MuiTextField
          className={classes.marginTop_2}
          variant="standard"
          fullWidth
          label={t('Score')}
          type="number"
          error={!!errors.expectation_score}
          helperText={errors.expectation_score && errors.expectation_score?.message}
          inputProps={register('expectation_score')}
        />
        <div className={classes.buttons}>
          <Button
            type="submit"
            disabled={validated || isSubmitting}
          >
            {t('Validate')}
          </Button>
        </div>
      </Alert>
    </form>
  );
};

interface Props {
  exerciseId: string;
  inject: Inject;
  expectations: InjectExpectationsStore[] | null;
  open: boolean;
  onClose: () => void;
}

const ManualExpectationsValidation: FunctionComponent<Props> = ({
  exerciseId,
  inject,
  expectations,
  open,
  onClose,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();

  return (
    <Drawer
      open={open}
      handleClose={onClose}
      title={t('Expectations of ') + inject.inject_title}
    >
      <>
        {expectations
          && expectations.map((e) => <ManualExpectationsValidationForm key={e.inject_expectation_id} exerciseId={exerciseId} expectation={e} />)
        }
        <div className={classes.buttons}>
          <Button
            variant="contained"
            onClick={onClose}
          >
            {t('Close')}
          </Button>
        </div>
      </>
    </Drawer>
  );
};
export default ManualExpectationsValidation;
