import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField } from '@mui/material';
import React, { SyntheticEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormatter } from '../../../../components/i18n';
import type { AssetGroupInput } from '../../../../utils/api-types';
import { zodImplement } from '../../../../utils/Zod';
import TagField from '../../../../components/field/TagField';

interface Props {
  onSubmit: SubmitHandler<AssetGroupInput>;
  handleClose: () => void;
  editing?: boolean;
  initialValues?: AssetGroupInput;
}

const AssetGroupForm: React.FC<Props> = ({
  onSubmit,
  handleClose,
  editing,
  initialValues = {
    asset_group_name: '',
    asset_group_description: '',
    asset_group_tags: [],
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AssetGroupInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<AssetGroupInput>().with({
        asset_group_name: z.string().min(1, { message: t('Should not be empty') }),
        asset_group_description: z.string().optional(),
        asset_group_tags: z.string().array().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  const handleSubmitWithoutPropagation = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  return (
    <form id="assetGroupId" onSubmit={handleSubmitWithoutPropagation}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Name')}
        error={!!errors.asset_group_name}
        helperText={errors.asset_group_name?.message}
        inputProps={register('asset_group_name')}
        InputLabelProps={{ required: true }}
      />
      <TextField
        variant="standard"
        fullWidth
        multiline
        rows={2}
        label={t('Description')}
        style={{ marginTop: 20 }}
        error={!!errors.asset_group_description}
        helperText={errors.asset_group_description?.message}
        inputProps={register('asset_group_description')}
      />

      <Controller
        control={control}
        name="asset_group_tags"
        render={({ field: { onChange, value } }) => (
          <TagField
            name="asset_group_tags"
            label={t('Tags')}
            fieldValue={value ?? []}
            fieldOnChange={onChange}
            errors={errors}
            style={{ marginTop: 20 }}
          />
        )}
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

export default AssetGroupForm;
