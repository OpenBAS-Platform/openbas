import { Controller, SubmitHandler, useForm, FormProvider, useFieldArray } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import {
  TextField,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Autocomplete,
} from '@mui/material';
import { Add, ExpandMore, Settings, DeleteOutline } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CogOutline } from 'mdi-material-ui';
import type { FilterGroup, InjectImporterAddInput, MapperAddInput, RuleAttributeAddInput, SearchPaginationInput } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import { zodImplement } from '../../../../../utils/Zod';
import InjectContractComponent from '../../../../../components/InjectContractComponent';
import { fetchInjectorContract, fetchInjectorsContracts, searchInjectorContracts } from '../../../../../actions/InjectorContracts';
import { initSorting } from '../../../../../components/common/pagination/Page';
import { InjectorContractStore } from '../../../../../actions/injector_contracts/InjectorContract';
import RegexComponent from '../../../../../components/RegexComponent';
import { InjectorContractHelper } from '../../../../../actions/injector_contracts/injector-contract-helper';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../../utils/hooks';
import RulesContractContent from './RulesContractContent';

const useStyles = makeStyles(() => ({
  importerStyle: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 20,
  },
  importersErrorMessage: {
    fontSize: 13,
    color: '#f44336',
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

  const methods = useForm<MapperAddInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<MapperAddInput>().with({
        mapper_name: z.string().min(1, { message: t('Should not be empty') }),
        mapper_inject_importers: z.any().array().min(1, { message: t('At least one inject importer is required') }),
        mapper_inject_type_column: z
          .string()
          .min(1, { message: t('Should not be empty') }),
      }),
    ),
    defaultValues: initialValues,
  });
  const { control } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mapper_inject_importers',

  });

  const onSubmit = (data) => console.log(data);

  return (
    <form id="mapperForm" onSubmit={methods.handleSubmit(onSubmit)}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Mapper name')}
        style={{ marginTop: 10 }}
        error={!!methods.formState.errors.mapper_name}
        helperText={methods.formState.errors.mapper_name?.message}
        inputProps={methods.register('mapper_name')}
        InputLabelProps={{ required: true }}
      />

      <Controller
        control={control}
        name={'mapper_inject_type_column'}
        render={({ field: { onChange } }) => (
          <RegexComponent
            label={t('Inject type column')}
            onChange={onChange}
            errors={methods.formState.errors}
            name={'mapper_inject_type_column'}
          />
        )}
      />

      <div className={classes.importerStyle}>
        <Typography variant="h3" sx={{ m: 0 }}>
          {t('Inject importer')}
        </Typography>
        <IconButton
          color="secondary"
          aria-label="Add"
          onClick={() => {
            append({ inject_importer_name: '', inject_importer_type_value: '', inject_importer_injector_contract_id: '' });
          }}
          size="large"
        >
          <Add fontSize="small" />
        </IconButton>
        <div>
          <span className={classes.importersErrorMessage}>{methods.formState.errors.mapper_inject_importers?.message}</span>
        </div>
      </div>

      {fields.map((field, index) => (
        <RulesContractContent
          key={field.id}
          field={field}
          methods={methods}
          index={index}
          remove={remove}
        />
      ))}

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
    </form>

  );
};

export default MapperForm;
