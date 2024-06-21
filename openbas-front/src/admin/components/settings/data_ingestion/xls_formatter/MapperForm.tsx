import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import React from 'react';
import { TextField, InputLabel, MenuItem, SelectChangeEvent, Button, Typography, IconButton } from '@mui/material';
import { Add } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { MapperAddInput } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import { zodImplement } from '../../../../../utils/Zod';
import InjectImporterForm from './InjectImporterForm';

const useStyles = makeStyles(() => ({
  importerStyle: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 20,
  },
  importerTextfieldStyle: {
    position: 'relative',
    top: '15px',
    right: '95px',
  },

}));

interface Props {
  OnSubmit: SubmitHandler<MapperAddInput>;
  handleClose: () => void;
  editing?: boolean;
  initialValues?: MapperAddInput;
}

const MapperForm: React.FC<Props> = ({
  OnSubmit,
  handleClose,
  editing,
  initialValues = {
    mapper_name: '',
    mapper_inject_type_column: '',
    mapper_inject_importers: [],
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<MapperAddInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<MapperAddInput>().with({
        mapper_name: z.string().min(1, { message: t('Should not be empty') }),
        mapper_inject_importers: z.any().array().optional(),
        mapper_inject_type_column: z
          .string()
          .min(1, { message: t('Should not be empty') })
          .regex(/^[A-Z]{1,2}$/, 'Invalid')
          .optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  // const [showMapperField, setShowMapperField] = React.useState(false);

  return (
    <form id="mapperForm" onSubmit={handleSubmit(OnSubmit)}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Mapper name')}
        style={{ marginTop: 10 }}
        error={!!errors.mapper_name}
        helperText={errors.mapper_name?.message}
        inputProps={register('mapper_name')}
        InputLabelProps={{ required: true }}
      />

      <TextField
        label={t('Inject type column')}
        style={{ marginTop: 20 }}
        variant="standard"
        fullWidth
        error={!!errors.mapper_inject_type_column}
        helperText={errors.mapper_inject_type_column?.message}
        inputProps={register('mapper_inject_type_column')}
        InputLabelProps={{ required: true }}
      />

      <div className={classes.importerStyle}>
        <Typography variant="h3" sx={{ m: 0 }}>
          {t('Inject importer')}
        </Typography>
        <IconButton
          color="secondary"
          aria-label="Add"
          // onClick={() => setShowMapperField(true)}
          size="large"
        >
          <Add fontSize="small" />
        </IconButton>
        <TextField
          variant="standard"
          fullWidth
          className={classes.importerTextfieldStyle}
          error={!!errors.mapper_inject_importers}
          helperText={errors.mapper_inject_importers?.message}
          inputProps={register('mapper_inject_importers')}
        />
        {/* {
          showMapperField
          && (
            <Controller
              control={control}
              name="mapper_inject_importers"
              render={({ field }) => (
                <TextField
                  select
                  variant="standard"
                  fullWidth
                  value={field.value}
                  label={t('Importer')}
                  className={classes.importerTextfieldStyle}
                  error={!!errors.mapper_inject_importers}
                  helperText={errors.mapper_inject_importers?.message}
                  inputProps={register('mapper_inject_importers')}
                >
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                </TextField>
              )}
            />
          )
        } */}
      </div>

      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          variant="contained"
          onClick={handleClose}
          style={{ marginRight: 10 }}
          // disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          // disabled={!isDirty || isSubmitting}
        >
          {editing ? t('Update') : t('Create')}
        </Button>
      </div>
      <div>
        <InjectImporterForm />
      </div>
    </form>
  );
};

export default MapperForm;

/*
 <Controller
        control={control}
        name="mapper_inject_type_column"
        render={({ field }) => (
          <TextField
            select
            label={t('Inject type column')}
            style={{ marginTop: 20 }}
            variant="standard"
            fullWidth
            value={field.value}
            error={!!errors.mapper_inject_type_column}
            helperText={errors.mapper_inject_type_column?.message}
            inputProps={register('mapper_inject_type_column')}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
          </TextField>
        )}
      /> */

/* <div className={classNames(classes.center, classes.marginTop)}>
        <Typography variant="h3" sx={{ m: 0 }}>
          {t_i18n('Representations for entity')}
        </Typography>
        <IconButton
          color="secondary"
          aria-label="Add"
          onClick={() => onAddEntityRepresentation(setFieldValue, values)
          }
          size="large"
        >
          <Add fontSize="small" />
        </IconButton>
      </div> */
