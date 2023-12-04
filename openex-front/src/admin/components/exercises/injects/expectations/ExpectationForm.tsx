import React, { FunctionComponent } from 'react';
import { useFormatter } from '../../../../../components/i18n';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodImplement } from '../../../../../utils/Zod';
import { z } from 'zod';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { ExpectationInput } from '../../../../../actions/Expectation';

interface ExpectationFormProps {
  onSubmit: SubmitHandler<ExpectationInput>;
  handleClose: () => void;
  editing?: boolean;
  initialValues?: ExpectationInput;
}

const ExpectationForm: FunctionComponent<ExpectationFormProps> = ({
  onSubmit,
  handleClose,
  editing = false,
  initialValues = {
    expectation_name: '',
    expectation_description: '',
    expectation_score: 0
  }
}) => {
  const { t } = useFormatter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ExpectationInput>({
    mode: 'onTouched',
    resolver: zodResolver(zodImplement<ExpectationInput>().with({
      expectation_name: z.string(),
      expectation_description: z.string().optional(),
      expectation_score: z.coerce.number(),
    })),
    defaultValues: initialValues,
  });

  const handleSubmitWithoutPropagation = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  return (
    <form id="expectationForm" onSubmit={handleSubmitWithoutPropagation}>
      <MuiTextField
        variant="standard"
        fullWidth={true}
        label={t('Name')}
        error={!!errors.expectation_name}
        helperText={
          errors.expectation_name && errors.expectation_name?.message
        }
        inputProps={register('expectation_name')}
      />
      <MuiTextField
        variant="standard"
        fullWidth={true}
        label={t('Description')}
        style={{ marginTop: 20 }}
        error={!!errors.expectation_description}
        helperText={
          errors.expectation_description && errors.expectation_description?.message
        }
        inputProps={register('expectation_description')}
      />
      <MuiTextField
        variant="standard"
        fullWidth={true}
        label={t('Score')}
        type="number"
        style={{ marginTop: 20 }}
        error={!!errors.expectation_score}
        helperText={
          errors.expectation_score && errors.expectation_score?.message
        }
        inputProps={register('expectation_score')}
      />
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          onClick={handleClose}
          style={{ marginRight: 10 }}
          disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
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

export default ExpectationForm;
