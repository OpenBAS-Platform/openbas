import { Controller, FieldArrayWithId, useFieldArray, UseFieldArrayRemove, UseFormReturn } from 'react-hook-form';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Badge, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemText, TextField, Tooltip, Typography, } from '@mui/material';
import { DeleteOutlined, ExpandMore } from '@mui/icons-material';
import { CogOutline } from 'mdi-material-ui';
import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { directFetchInjectorContract, searchInjectorContracts } from '../../../../../actions/InjectorContracts';
import InjectContractComponent from '../../../../../components/InjectContractComponent';
import { useFormatter } from '../../../../../components/i18n';
import RegexComponent from '../../../../../components/RegexComponent';
import type { InjectorContractStore } from '../../../../../actions/injector_contracts/InjectorContract';
import type { FilterGroup, ImportMapperAddInput, InjectorContract, SearchPaginationInput } from '../../../../../utils/api-types';
import { initSorting } from '../../../../../components/common/pagination/Page';

const useStyles = makeStyles(() => ({
  rulesArray: {
    gap: '10px',
    width: '100%',
    display: 'inline-grid',
    marginTop: '10px',
    alignItems: 'center',
    gridTemplateColumns: ' 1fr 3fr 50px',
  },
  container: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  redStar: {
    color: 'rgb(244, 67, 54)',
    marginLeft: '2px',
  },
  red: {
    borderColor: 'rgb(244, 67, 54)',
  },
}));

interface Props {
  field: FieldArrayWithId<ImportMapperAddInput, 'mapper_inject_importers', 'id'>;
  methods: UseFormReturn<ImportMapperAddInput>;
  index: number;
  remove: UseFieldArrayRemove;
  editing?: boolean;
}

const RulesContractContent: React.FC<Props> = ({
  field,
  methods,
  index,
  remove,
  editing,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();

  // Fetching data

  const { control, formState: { errors } } = methods;

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

  const onChangeInjectorContractId = () => {
      directFetchInjectorContract(methods.getValues(`mapper_inject_importers.${index}.inject_importer_injector_contract_id`)).then((result: { data: InjectorContract }) => {
        const injectorContract = result.data;
        const contractFieldKeys = injectorContract?.convertedContent?.fields.map((f) => f.key);
        rulesRemove();
        AddRules(contractFieldKeys);
      });
  }

  const [currentRuleIndex, setCurrentRuleIndex] = useState<number | null>(null);
  const handleDefaultValueOpen = (rulesIndex: number) => {
    setCurrentRuleIndex(rulesIndex);
  };
  const handleDefaultValueClose = () => {
    setCurrentRuleIndex(null);
  };

  const [openAlertDelete, setOpenAlertDelete] = React.useState(false);

  const handleClickOpenAlertDelete = () => {
    setOpenAlertDelete(true);
  };

  const handleCloseAlertDelete = () => {
    setOpenAlertDelete(false);
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
    <>
      <Accordion
        key={field.id}
        variant="outlined"
        style={{ width: '100%' }}
        className={classNames({
          [classes.red]: !!errors.mapper_inject_importers?.[index],
        })}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
        >
          <div className={classes.container}>
            <Typography>
              {t('Inject importer')} {index + 1}
            </Typography>
            <Tooltip title={t('Delete')}>
              <IconButton color="error" onClick={handleClickOpenAlertDelete}>
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
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
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <InjectContractComponent
                fetch={searchInjectorContracts}
                searchPaginationInput={searchPaginationInput}
                setContent={setContracts}
                label={t('Inject importer injector contract')}
                injectorContracts={contracts}
                onChange={(data) => {
                  onChange(data);
                  onChangeInjectorContractId();
                }}
                error={error}
                fieldValue={value}
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
                            {ruleField.rule_attribute_name} <span className={classes.redStar}>*</span>
                          </Typography>
                          <Controller
                            control={control}
                            name={`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_columns` as const}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                              <RegexComponent label={t('Rule attributes columns')} onChange={onChange} error={error}
                                              fieldValue={value}
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
                        PaperProps={{ elevation: 1 }}
                        onClose={handleDefaultValueClose}
                      >
                        <DialogTitle>
                          {t('Attribute mapping configuration')}
                        </DialogTitle>
                        <DialogContent>
                          <TextField
                            fullWidth
                            label={t('Rule attribute default value')}
                            inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${currentRuleIndex}.rule_attribute_default_value`)}
                          />
                          {
                            currentRuleIndex === rulesFields.length - 1 && <TextField
                              label={t('Rule additional config')}
                              fullWidth
                              inputProps={methods.register(`mapper_inject_importers.${index}.inject_importer_rule_attributes.${rulesIndex}.rule_attribute_additional_config.timePattern` as const)}
                            />
                          }
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleDefaultValueClose} autoFocus>
                            {t('Close')}
                          </Button>
                        </DialogActions>
                      </Dialog>
                    }
                  </ListItem>
                </List>
              );
            })
          }

        </AccordionDetails>
        <AccordionActions>
          <Button color="error" variant="contained" onClick={handleClickOpenAlertDelete}>{t('Delete')}</Button>
        </AccordionActions>
      </Accordion>

      <Dialog
        open={openAlertDelete}
        onClose={handleCloseAlertDelete}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this representation?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlertDelete}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={() => {
            remove(index);
            handleCloseAlertDelete();
          }}
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RulesContractContent;
