import { UseFormReturn, Controller, UseFieldArrayRemove, FieldArrayWithId, useFieldArray } from 'react-hook-form';
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
} from '@mui/material';
import { ExpandMore, DeleteOutline } from '@mui/icons-material';
import { CogOutline } from 'mdi-material-ui';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { directFetchInjectorContract, searchInjectorContracts } from '../../../../../actions/InjectorContracts';
import InjectContractComponent from '../../../../../components/InjectContractComponent';
import { useFormatter } from '../../../../../components/i18n';
import RegexComponent from '../../../../../components/RegexComponent';
import type { InjectorContractStore } from '../../../../../actions/injector_contracts/InjectorContract';
import type { FilterGroup, InjectorContract, MapperAddInput, SearchPaginationInput } from '../../../../../utils/api-types';
import { initSorting } from '../../../../../components/common/pagination/Page';

const useStyles = makeStyles(() => ({
  rulesArray: {
    gap: '10px',
    width: '100%',
    display: 'inline-grid',
    marginTop: '10px',
    alignItems: 'center',
    gridTemplateColumns: ' 2fr 3fr 50px',
  },
}));

interface Props {
  field: FieldArrayWithId<MapperAddInput, 'mapper_inject_importers', 'id'>;
  methods: UseFormReturn<MapperAddInput>;
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

  const { fields: rulesFields, remove: rulesRemove, append: rulesAppend } = useFieldArray({
    control,
    name: `mapper_inject_importers.${index}.inject_importer_rule_attributes`,
  });

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

  const [currentRuleIndex, setCurrentRuleIndex] = useState<number | null>(null);
  const handleDefaultValueOpen = (rulesIndex: number) => {
    setCurrentRuleIndex(rulesIndex);
  };
  const handleDefaultValueClose = () => {
    setCurrentRuleIndex(null);
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
          error={!!methods.formState.errors.mapper_inject_importers?.[index]?.inject_importer_type_value}
          helperText={methods.formState.errors.mapper_inject_importers?.[index]?.inject_importer_type_value?.message}
        />
        <Controller
          control={control}
          name={`mapper_inject_importers.${index}.inject_importer_injector_contract_id` as const}
          render={({ field: { onChange }, fieldState: { error } }) => (
            <InjectContractComponent
              fetch={searchInjectorContracts}
              searchPaginationInput={searchPaginationInput}
              setContent={setContracts}
              label={t('Inject importer injector contract')}
              injectorContracts={contracts}
              onChange={(data) => {
                onChange(data);
              }}
              error={error}
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
                        <Typography
                          variant="subtitle1" {...methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_name` as const)}
                        >
                          {ruleField.rule_attribute_name}
                        </Typography>
                        <Controller
                          control={control}
                          name={`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_columns` as const}
                          render={({ field: { onChange }, fieldState: { error } }) => (
                            <RegexComponent label={t('Rule attributes columns')} onChange={onChange} error={error}
                              name={`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_columns`}
                            />
                          )}
                        />
                        <IconButton
                          color="primary"
                          onClick={() => handleDefaultValueOpen(rulesIndex)}
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
                  {currentRuleIndex !== null
                    && <Dialog
                      open
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
                          inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${currentRuleIndex}.rule_attribute_default_value`)}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleDefaultValueClose} autoFocus>
                          {t('Close')}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  }
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
