import { Alert, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
  useFormContext,
  useWatch,
} from 'react-hook-form';

import RichTextField from '../../../../../components/fields/RichTextField';
import SelectFieldController from '../../../../../components/fields/SelectFieldController';
import SeparatorFieldController from '../../../../../components/fields/SeparatorFieldController';
import SwitchFieldController from '../../../../../components/fields/SwitchFieldController';
import TagFieldController from '../../../../../components/fields/TagFieldController';
import TextFieldController from '../../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../../components/i18n';
import InjectEndpointsList from './endpoints/InjectEndpointsList';

type ChoiceItem = {
  label: string;
  value: string;
  information: string;
};
export type InjectField = {
  key: string;
  richText?: boolean;
  cardinality?: string;
  mandatory?: boolean;
  defaultValue?: string | string[];
  choices?: Record<string, string> | ChoiceItem[];
  label: string;
  contractAttachment?: {
    key: string;
    label: string;
  }[];
  type: 'textarea' | 'text' | 'select' | 'number' | 'checkbox' | 'dependency-select' | 'choice' | 'tags' | 'targeted-asset';
  linkedFields?: {
    key: string;
    type: string;
  }[];
  dependencyField?: string;
  settings?: {
    rows: number;
    required?: boolean;
  };
};

interface Props {
  field: InjectField;
  readOnly: boolean;
}

const InjectContentFieldComponent = ({
  field,
  readOnly,
}: Props) => {
  const { t } = useFormatter();
  const theme = useTheme();
  const { control, getValues } = useFormContext();
  const values = getValues();

  const selectedValue = useWatch({
    control,
    name: field.key,
  });
  const [informationToDisplay, setInformationToDisplay] = useState<string>('');
  let fieldType: InjectField['type'] | 'richText' = field.type;
  if (field.type == 'textarea' && field.richText) {
    fieldType = 'richText';
  }

  useEffect(() => {
    const findInformation = (value: string) => (field.choices as ChoiceItem[]).find(c => c.value === value)?.information ?? '';
    if (!selectedValue && field.type === 'choice') {
      setInformationToDisplay(findInformation(values[field.key]) ?? findInformation((field.defaultValue || [])[0]));
    }
    if (selectedValue && field.type === 'choice') {
      setInformationToDisplay(findInformation(selectedValue));
    }
  }, [selectedValue]);

  const fieldComponent = () => {
    switch (fieldType) {
      case 'tags':
        return (
          <TagFieldController
            name={field.key}
            label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
            disabled={readOnly}
          />
        );
      case 'richText':
        return (
          <RichTextField
            key={field.key}
            name={field.key}
            label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
            style={{ height: 250 }}
            disabled={readOnly}
            askAi={true}
            inInject={true}
            control={control}
          />
        );
      case 'checkbox':
        return (
          <SwitchFieldController
            name={field.key}
            label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
            disabled={readOnly}
            required={field.settings?.required}
          />
        );
      case 'select':
      case 'choice':
      case 'dependency-select': {
        let choices = [];

        const makeChoiceItems = (entries: [string, string][]) =>
          entries.toSorted((a, b) => a[1].localeCompare(b[1]))
            .map(([k, v]) => ({
              value: k,
              label: t(v || 'Unknown'),
            }));

        if (fieldType === 'dependency-select') {
          const depValue = values[field.dependencyField ?? ''];
          const depChoices = ((field.choices as Record<string, string>)[depValue]) as unknown as Record<string, string> ?? {};
          choices = makeChoiceItems(Object.entries(depChoices));
        } else if (fieldType === 'select') {
          choices = makeChoiceItems(Object.entries(field.choices as Record<string, string>));
        } else {
          choices = field.choices as ChoiceItem[];
        }
        const label = field.label?.toLowerCase().includes('targeted property')
          ? `${field.label} - ${(field.key?.split('.')?.at(-1) ?? '').replace('targeted-property-', '')}`
          : field.label;
        return (
          <SelectFieldController
            name={field.key}
            label={`${t(label)} ${field.mandatory ? '*' : ''}`}
            items={choices as ChoiceItem[]}
            multiple={field.cardinality === 'n'}
            disabled={readOnly}
            required={field.settings?.required}
          />
        );
      }
      case 'targeted-asset':
        return (
          < >
            <Typography variant="h5">
              {`${t('Remote Asset')} - ${field.key.split('.').at(-1)} ${field.mandatory ? '*' : ''}`}
            </Typography>
            <InjectEndpointsList
              name={field.key}
            />
          </>
        );
      default:{
        const label = field.linkedFields?.length && field.linkedFields?.length > 0
          ? `${field.label} - ${field.linkedFields.map(f => f.key).join(', ')}`
          : field.label;
        if (field.key.includes('targeted-asset-separator')) {
          return (
            <SeparatorFieldController
              name={field.key}
              label={`${t(label)}${field.mandatory ? ' *' : ''}`}
              disabled={readOnly}
              defaultValue={field.defaultValue as string}
            />
          );
        }
        return (
          <TextFieldController
            name={field.key}
            label={`${t(label)}${field.mandatory ? ' *' : ''}`}
            disabled={readOnly}
            multiline={field.type == 'textarea'}
            rows={field.type == 'textarea' ? (field.settings?.rows ?? 10) : 1}
            required={field.settings?.required}
            type={field.type === 'number' ? 'number' : 'text'}
          />
        );
      }
    }
  };

  return (
    <div>
      {fieldComponent()}
      {informationToDisplay && <Alert sx={{ marginTop: theme.spacing(1) }} severity="warning">{informationToDisplay}</Alert>}
    </div>
  );
};

export default InjectContentFieldComponent;
