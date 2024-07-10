import { UseFormReturn, Controller, UseFieldArrayRemove, FieldArrayWithId, FieldArray, useFieldArray, Control, useForm } from 'react-hook-form';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  IconButton,
  Button,
  ListItemIcon,
} from '@mui/material';
import { ExpandMore, DeleteOutline } from '@mui/icons-material';
import { CogOutline } from 'mdi-material-ui';
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { makeStyles } from '@mui/styles';
import { directFetchInjectorContract, fetchInjectorContract, fetchInjectorsContracts, searchInjectorContracts } from '../../../../../actions/InjectorContracts';
import type { InjectorContractHelper } from '../../../../../actions/injector_contracts/injector-contract-helper';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../../utils/hooks';
import InjectContractComponent from '../../../../../components/InjectContractComponent';
import { useFormatter } from '../../../../../components/i18n';
import RegexComponent from '../../../../../components/RegexComponent';
import { InjectorContractStore } from '../../../../../actions/injector_contracts/InjectorContract';
import type { FilterGroup, InjectImporterAddInput, InjectorContract, InjectResultDTO, MapperAddInput, SearchPaginationInput } from '../../../../../utils/api-types';
import { initSorting } from '../../../../../components/common/pagination/Page';
import { zodImplement } from '../../../../../utils/Zod';

const useStyles = makeStyles(() => ({
  rulesArray: {
    display: 'flex',
    flexDiretion: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

interface Props {
  field: FieldArrayWithId<MapperAddInput, 'mapper_inject_importers', 'id'>;
  methods: UseFormReturn<MapperAddInput, any, undefined>;
  index: number;
  remove: UseFieldArrayRemove;
}

const RulesContractContent: React.FC<Props> = ({
  field,
  methods,
  index,
  remove,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();

  // Fetching data

  const { control, watch } = methods;

  const injectorContractId = watch(`mapper_inject_importers.${index}.inject_importer_injector_contract_id`);

  const importerInitialValues: InjectImporterAddInput = {
    inject_importer_name: '',
    inject_importer_type_value: '',
    inject_importer_injector_contract_id: '',
    inject_importer_rule_attributes: [],
  };
  const importersMethods = useForm<InjectImporterAddInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<InjectImporterAddInput>().with({
        inject_importer_name: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_type_value: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_injector_contract_id: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_rule_attributes: z.any().array().min(1, { message: t('Should not be empty') }),
      }),
    ),
    defaultValues: importerInitialValues,
  });

  const { control: rulesControl, formState: { errors } } = importersMethods;
  const { fields: rulesFields, remove: rulesRemove, append: rulesAppend } = useFieldArray({
    control: rulesControl,
    name: 'inject_importer_rule_attributes',
  });

  console.log(`rules contract context error: ${JSON.stringify(errors)}`);

  const AddRules = (contractFieldKeys: string[]) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < contractFieldKeys?.length; i++) {
      rulesAppend({
        rule_attribute_name: contractFieldKeys[i],
        rule_attribute_columns: '',
        rule_attribute_default_value: '',
      });
    }
    rulesAppend({
      rule_attribute_name: 'trigger_time',
      rule_attribute_columns: '',
      rule_attribute_default_value: '',
      rule_attribute_additional_config: { '': '' },
    });
  };

  useEffect(() => {
    if (injectorContractId) {
      directFetchInjectorContract(methods.getValues(`mapper_inject_importers.${index}.inject_importer_injector_contract_id`)).then((result: { data: InjectorContract }) => {
        const injectorContract = result.data;
        const contractFieldKeys = injectorContract?.convertedContent?.fields.map((f) => f.key);
        rulesRemove();
        AddRules(contractFieldKeys);
      });
    }
  }, [injectorContractId]);

  const [defaultValue, setDefaultValue] = React.useState(false);
  const handleDefaultValueOpen = () => {
    setDefaultValue(true);
  };
  const handleDefaultValueClose = () => {
    setDefaultValue(false);
  };

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
          error={!!methods.formState.errors.mapper_inject_importers?.[index]?.inject_importer_name}
          helperText={methods.formState.errors.mapper_inject_importers?.[index]?.inject_importer_name?.message}
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
              onChange={(data) => {
                onChange(data);
              }}
            />
          )}
        />
        {
          rulesFields.map((ruleField, rulesIndex) => {
            return (
              <List key={ruleField.id} style={{ marginTop: 20 }}>
                <ListItem key={ruleField.id}>
                  <ListItemText
                    primary={
                      <div className={classes.rulesArray}>
                        <TextField
                          label="Rule title"
                          defaultValue={ruleField.rule_attribute_name}
                          InputProps={{
                            readOnly: true,
                          }}
                          inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_name` as const)}
                        />
                        <Controller
                          control={control}
                          name={`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_columns` as const}
                          render={({ field: { onChange } }) => (
                            <RegexComponent label={t('Rule attributes columns')} onChange={onChange} errors={methods.formState.errors}
                              name={`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_columns`}
                            />
                          )}
                        />
                        <IconButton
                          color="primary"
                          onClick={handleDefaultValueOpen}
                        >
                          <Badge color="secondary" variant="dot"
                            invisible={!methods.getValues(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_default_value`)
                                   || methods.getValues(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_default_value`)?.length === 0}
                          >
                            <CogOutline />
                          </Badge>
                        </IconButton>
                      </div>
                    }
                  />
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
                        label={t('Rule attribute default value')}
                        inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_default_value` as const)}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleDefaultValueClose} autoFocus>
                        {t('Close')}
                      </Button>
                    </DialogActions>
                  </Dialog>
                  {
                    rulesIndex === rulesFields.length - 1 && <ListItemText>
                      <TextField
                        label={t('Rule additional config')}
                        fullWidth
                        inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_additional_config.timePattern` as const)}
                      />
                    </ListItemText>
                  }

                </ListItem>
              </List>
            );
          })
        }

      </AccordionDetails>
    </Accordion>
  );
};

export default RulesContractContent;
