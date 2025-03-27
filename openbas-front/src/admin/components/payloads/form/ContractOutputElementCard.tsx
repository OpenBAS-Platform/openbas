import { DeleteOutlined } from '@mui/icons-material';
import { Card, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import CheckboxFieldController from '../../../../components/fields/CheckboxFieldController';
import SelectFieldController from '../../../../components/fields/SelectFieldController';
import TagFieldController from '../../../../components/fields/TagFieldController';
import TextFieldController from '../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../components/i18n';

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
    alignItems: 'center',
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
  const [regexGroupFields, setRegexGroupFields] = useState<{
    value: string;
    label: string;
  }[]>([]);
  const selectedContractOutputElementType = watch(`${prefixName}.${index}.contract_output_element_type`);

  const outputParserTypeList = [
    {
      value: 'text',
      label: t('Text'),
      fields: [{
        value: 'text',
        label: t('Text'),
      }],
    },
    {
      value: 'number',
      label: t('Number'),
      fields: [{
        value: 'number',
        label: t('Number'),
      }],
    }, {
      value: 'port',
      label: t('Port'),
      fields: [{
        value: 'port',
        label: t('Port'),
      }],
    }, {
      value: 'portscan',
      label: t('Port scan'),
      fields: [{
        value: 'asset_id',
        label: t('Asset Id'),
      }, {
        value: 'host',
        label: t('Host'),
      }, {
        value: 'port',
        label: t('Port'),
      }, {
        value: 'service',
        label: t('Service'),
      }],
    }, {
      value: 'ipv4',
      label: 'IPv4',
      fields: [{
        value: 'ipv4',
        label: 'IPv4',
      }],
    }, {
      value: 'ipv6',
      label: 'IPv6',
      fields: [{
        value: 'ipv6',
        label: 'IPv6',
      }],
    }, {
      value: 'credentials',
      label: t('Credentials'),
      fields: [{
        value: 'username',
        label: t('Username'),
      }, {
        value: 'password',
        label: t('Password'),
      }],
    },
  ];

  useEffect(() => {
    if (selectedContractOutputElementType) {
      const outputParserFields = outputParserTypeList.find(item => item.value === selectedContractOutputElementType)?.fields;
      if (outputParserFields) {
        setRegexGroupFields(outputParserFields);
        outputParserFields.forEach((field, i) => {
          setValue(`${prefixName}.${index}.contract_output_element_regex_groups.${i}.regex_group_field`, field.value);
        });
      }
    }
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
      {regexGroupFields.length > 0 && (
        <Typography className={classes.outputValueTitle} variant="h3">
          {`${t('Output value')}`}
        </Typography>
      )}
      {regexGroupFields.map((field, indexField) => (
        <>
          <Typography sx={{ margin: 0 }} variant="h3">{field.label}</Typography>
          <TextFieldController placeholder={`$${indexField + 1}`} isCommand style={{ gridColumn: 'span 5' }} name={`${prefixName}.${index}.contract_output_element_regex_groups.${indexField}.regex_group_index_values`} required />
        </>
      ))}
    </Card>
  );
};

export default ContractOutputElementCard;
