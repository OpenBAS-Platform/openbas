import React, { FunctionComponent } from 'react';
import { Button } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormatter } from '../../../../../components/i18n';
import type { LessonsTemplateCategoryInput } from '../../../../../utils/api-types';
import { zodImplement } from '../../../../../utils/Zod';
import TextField from '../../../../../components/fields/TextField';

interface Props {
  onSubmit: SubmitHandler<LessonsTemplateCategoryInput>;
  handleClose: () => void;
  editing?: boolean;
  initialValues?: LessonsTemplateCategoryInput;
}

const LessonsTemplateCategoryForm: FunctionComponent<Props> = ({
  onSubmit,
  handleClose,
  initialValues = {
    lessons_template_category_name: '',
    lessons_template_category_description: '',
    lessons_template_category_order: 0,
  },
  editing = false,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<LessonsTemplateCategoryInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<LessonsTemplateCategoryInput>().with({
        lessons_template_category_name: z.string().min(1, { message: t('Should not be empty') }),
        lessons_template_category_description: z.string().optional(),
        // @ts-expect-error: should be handled as a number
        lessons_template_category_order: z.string().min(1, { message: t('Should not be empty') }),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="lessonTemplateCategoryForm" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Name')}
        style={{ marginTop: 10 }}
        error={!!errors.lessons_template_category_name}
        helperText={errors.lessons_template_category_name?.message}
        inputProps={register('lessons_template_category_name')}
        InputLabelProps={{ required: true }}
      />
      <TextField
        variant="standard"
        fullWidth
        label={t('Description')}
        style={{ marginTop: 20 }}
        error={!!errors.lessons_template_category_description}
        helperText={errors.lessons_template_category_description?.message}
        inputProps={register('lessons_template_category_description')}
      />
      <TextField
        variant="standard"
        fullWidth
        label={t('Order')}
        style={{ marginTop: 20 }}
        error={!!errors.lessons_template_category_order}
        helperText={errors.lessons_template_category_order?.message}
        inputProps={register('lessons_template_category_order')}
        type="number"
      />
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          variant="contained"
          onClick={handleClose}
          style={{ marginRight: 10 }}
          disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
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

export default LessonsTemplateCategoryForm;
