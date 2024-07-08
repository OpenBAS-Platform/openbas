import { Controller, SubmitHandler, useForm, FormProvider, useFieldArray } from 'react-hook-form';
import React, { useState } from 'react';
import {
  TextField,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
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
} from '@mui/material';
import { Add, ExpandMore, Settings, DeleteOutline } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CogOutline } from 'mdi-material-ui';
import type { FilterGroup, InjectImporterAddInput, MapperAddInput, RuleAttributeAddInput, SearchPaginationInput } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import { zodImplement } from '../../../../../utils/Zod';
import InjectImporterForm from './InjectImporterForm';
import InjectContractComponent from '../../../../../components/InjectContractComponent';
import { searchInjectorContracts } from '../../../../../actions/InjectorContracts';
import { initSorting } from '../../../../../components/common/pagination/Page';
import { InjectorContractStore } from '../../../../../actions/injector_contracts/InjectorContract';

const useStyles = makeStyles(() => ({
  importerStyle: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 20,
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
  const { control } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mapper_inject_importers',
    rules: {
      required: {
        value: true,
        message: 'At least one is required',
      },
    },
  });

  const rulesMethods = useForm<InjectImporterAddInput>();
  const { control: rulesControl } = rulesMethods;
  const { fields: rulesFields, append: rulesAppend } = useFieldArray({
    control: rulesControl,
    name: 'inject_importer_rule_attributes',
  });

  // Contracts
  const importFilter: FilterGroup = {
    mode: 'and',
    filters: [
      {
        key: 'injector_contract_import_available',
        operator: 'eq',
        mode: 'and',
        values: ['true'],
      }],
  };
  const [contracts, setContracts] = useState<InjectorContractStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('injector_contract_labels'),
    filterGroup: importFilter,
  });

  const [defaultValue, setDefaultValue] = React.useState(false);
  const handleDefaultValueOpen = () => {
    setDefaultValue(true);
  };

  const handleDefaultValueClose = () => {
    setDefaultValue(false);
  };

  const onSubmit = (data) => console.log(data);

  /* const {
    register,
    control,
    handleSubmit,
    getValues,
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
  }); */

  /* const watchField = methods.watch(`mapper_inject_importers.${index}.inject_importer_injector_contract_id`);
  if (watchField.length !== 0) {
    for (let i = 0; i < 1; i++) {
      rulesAppend({ rule_attribute_name: '', rule_attribute_columns: '' });
    }
  } */

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

      <TextField
        label={t('Inject type column')}
        style={{ marginTop: 20 }}
        variant="standard"
        fullWidth
        error={!!methods.formState.errors.mapper_inject_type_column}
        helperText={methods.formState.errors.mapper_inject_type_column?.message}
        inputProps={methods.register('mapper_inject_type_column')}
        InputLabelProps={{ required: true }}
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
            rulesAppend({ rule_attribute_name: '', rule_attribute_columns: '', rule_attribute_default_value: '' });
          }}
          size="large"
        >
          <Add fontSize="small" />
        </IconButton>
      </div>

      {fields.map((field, index) => {
        const injectorContractWatch = methods.watch(`mapper_inject_importers.${index}.inject_importer_injector_contract_id`);
        return (
          <Accordion key={field.id}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>{t('Inject importer')} {index + 1}</Typography>
              <DeleteOutline color="error" onClick={() => {
                remove(index);
              }}
              />
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                variant="standard"
                fullWidth
                label={t('Inject importer name')}
                style={{ marginTop: 10 }}
                inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_name` as const)}
                InputLabelProps={{ required: true }}
              />
              <TextField
                variant="standard"
                fullWidth
                label={t('Inject importer type')}
                style={{ marginTop: 10 }}
                inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_type_value` as const)}
                InputLabelProps={{ required: true }}
              />
              <Controller
                control={control}
                name={`mapper_inject_importers.${index}.inject_importer_injector_contract_id` as const}
                render={({ field: { onChange } }) => (
                  <InjectContractComponent
                    fetch={searchInjectorContracts}
                    searchPaginationInput={searchPaginationInput}
                    setContent={setContracts}
                    label={t('Inject importer injector contract')}
                    injectorContracts={contracts}
                    onChange={onChange}
                  />
                )}
              />
              {
                rulesFields.map((rulesField, rulesIndex) => {
                  return (
                    <List key={rulesField.id} style={{ marginTop: 20 }}>
                      <ListItem key={rulesField.id}>
                        <ListItemText>
                          <TextField
                            label="Rule title"
                            defaultValue="Send mail"
                            InputProps={{
                              readOnly: true,
                            }}
                            inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_name` as const)}
                          />
                        </ListItemText>
                        <ListItem>
                          <TextField
                            fullWidth
                            label="Rule attributes columns"
                            inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_columns` as const)}
                          />
                        </ListItem>
                        <ListItem>
                          <IconButton
                            onClick={handleDefaultValueOpen}
                          >
                            <CogOutline color="primary" />
                          </IconButton>
                          <Dialog
                            open={defaultValue}
                            onClose={handleDefaultValueClose}
                            aria-labelledby="default-value-dialog-title"
                            aria-describedby="Configure optional settings to the field"
                          >
                            <DialogTitle id="default-value-dialog-title">
                              {t('Attribute mapping configuration')}
                            </DialogTitle>
                            <DialogContent>
                              <TextField
                                fullWidth
                                label="Rule attribute default value"
                                inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_default_value` as const)}
                              />
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleDefaultValueClose} autoFocus>
                                {t('Close')}
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </ListItem>
                      </ListItem>
                    </List>
                    /* <Grid container spacing={2} key={rulesField.id} style={{ marginTop: 20 }}>
                       <Grid item xs={5}>
                         <InputLabel> {t('Rule title')} </InputLabel>
                       </Grid>
                       <Grid item xs={5}>
                         <TextField
                           defaultValue="Send mail"
                           InputProps={{
                             readOnly: true,
                           }}
                         />
                       </Grid>
                       <Grid item xs={5}>
                         <InputLabel> {t('Rule description')} </InputLabel>
                       </Grid>
                       <Grid item xs={5}>
                         <TextField />
                       </Grid>
                       <Grid item xs={2}>
                         <Settings color="primary" />
                       </Grid>
                       <Grid item xs={5}>
                         <InputLabel> {t('Trigger time')} </InputLabel>
                       </Grid>
                       <Grid item xs={5}>
                         <TextField />
                       </Grid>
                       <Grid item xs={2}>
                         <Settings color="primary" />
                       </Grid>
                       <Grid item xs={5}>
                         <InputLabel> {t('Rule attribute name')} </InputLabel>
                       </Grid>
                       <Grid item xs={5}>
                         <TextField
                           inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_name` as const)}
                         />
                       </Grid>
                       <Grid item xs={2}>
                         <Settings color="primary" />
                       </Grid>
                       <Grid item xs={5}>
                         <InputLabel> {t('Rule attributes columns')} </InputLabel>
                       </Grid>
                       <Grid item xs={5}>
                         <TextField
                           inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_columns` as const)}
                         />
                       </Grid>
                       <Grid item xs={2}>
                         <Settings color="primary" />
                       </Grid>
                       <Grid item xs={5}>
                         <InputLabel> {t('Rule attribute default value')} </InputLabel>
                       </Grid>
                       <Grid item xs={5}>
                         <TextField
                           inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_default_value` as const)}
                         />
                       </Grid>
                       <Grid item xs={2}>
                         <Settings color="primary" />
                       </Grid>
                     </Grid> */
                  );
                })
              }

            </AccordionDetails>
          </Accordion>
        );
      })}

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
