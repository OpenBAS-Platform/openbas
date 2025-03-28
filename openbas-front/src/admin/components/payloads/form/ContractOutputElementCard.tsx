import { DeleteOutlined } from '@mui/icons-material';
import { Card, IconButton, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import CheckboxFieldController from '../../../../components/fields/CheckboxFieldController';
import SelectFieldController from '../../../../components/fields/SelectFieldController';
import TagFieldController from '../../../../components/fields/TagFieldController';
import TextFieldController from '../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../components/i18n';
import { type RegexGroup } from '../../../../utils/api-types';

interface Props {
  prefixName: string;
  index: number;
  remove: (index: number) => void;
}

const useStyles = makeStyles()(theme => ({
  outputParserElement: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr auto auto',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    alignItems: 'start',
  },
  outputValueTitle: {
    marginBottom: 0,
    marginTop: theme.spacing(2),
    gridColumn: 'span 6',
  },
}));

const ContractOutputElementCard = ({ prefixName, index, remove }: Props) => {
  const { classes } = useStyles();
  const { watch, setValue } = useFormContext();
  const { t } = useFormatter();

  const defaultFields = {
    credentials: ['username', 'password'],
    portscan: ['asset_id', 'host', 'port', 'service'],
  };

  const selectedContractOutputElementType = watch(`${prefixName}.${index}.contract_output_element_type`) as keyof typeof defaultFields | undefined;
  const regexGroups: RegexGroup[] = watch(`${prefixName}.${index}.contract_output_element_regex_groups`);

  const outputParserTypeList = [
    {
      value: 'text',
      label: t('Text'),
    }, {
      value: 'number',
      label: t('Number'),
    }, {
      value: 'port',
      label: t('Port'),
    }, {
      value: 'portscan',
      label: t('Port scan'),
    }, {
      value: 'ipv4',
      label: 'IPv4',
    }, {
      value: 'ipv6',
      label: 'IPv6',
    }, {
      value: 'credentials',
      label: t('Credentials'),
    },
  ];

  useEffect(() => {
    if (!selectedContractOutputElementType) return;

    const fields: string[] = defaultFields[selectedContractOutputElementType] || [selectedContractOutputElementType];

    const updatedGroups = fields.map((field) => {
      const existingGroup = regexGroups.find(group => group.regex_group_field === field);
      return {
        regex_group_field: field,
        regex_group_index_values: existingGroup?.regex_group_index_values || '',
      };
    });

    setValue(`${prefixName}.${index}.contract_output_element_regex_groups`, updatedGroups);
  }, [selectedContractOutputElementType]);

  return (
    <Card className={classes.outputParserElement} variant="outlined">
      <TextFieldController style={{ gridColumn: 'span 2' }} name={`${prefixName}.${index}.contract_output_element_name` as const} label={t('Name')} required />
      <TextFieldController style={{ gridColumn: 'span 2' }} name={`${prefixName}.${index}.contract_output_element_key` as const} label={t('Key')} required />
      <SelectFieldController style={{ width: '100%' }} name={`${prefixName}.${index}.contract_output_element_type` as const} label={t('Type')} items={outputParserTypeList} required />
      <IconButton
        onClick={() => remove(index)}
        size="small"
        color="primary"
      >
        <DeleteOutlined />
      </IconButton>
      <TagFieldController style={{ gridColumn: 'span 6' }} name={`${prefixName}.${index}.contract_output_element_tags` as const} label={t('Tags')} />
      <CheckboxFieldController style={{ gridColumn: 'span 6' }} name={`${prefixName}.${index}.contract_output_element_is_finding` as const} label={t('Show in findings')} />
      <TextFieldController isCommand style={{ gridColumn: 'span 6' }} name={`${prefixName}.${index}.contract_output_element_rule` as const} label={t('Regex group rules')} required />
      {regexGroups.length > 0 && (
        <Typography className={classes.outputValueTitle} variant="h3">
          {`${t('Output value')} *`}
        </Typography>
      )}
      {regexGroups.sort((a, b) => a.regex_group_field.localeCompare(b.regex_group_field)).map((field, indexField) => (
        <>
          <Typography
            sx={{
              margin: 0,
              alignSelf: 'center',
            }}
            variant="h3"
          >
            {field.regex_group_field}
          </Typography>
          <TextFieldController placeholder={`$${indexField + 1}`} isCommand style={{ gridColumn: 'span 5' }} name={`${prefixName}.${index}.contract_output_element_regex_groups.${indexField}.regex_group_index_values`} required />
        </>
      ))}
    </Card>
  );
};

export default ContractOutputElementCard;
