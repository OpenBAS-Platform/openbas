import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FormEvent, type SyntheticEvent, useState } from 'react';
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form';
import { z, type ZodTypeAny } from 'zod';

import { useFormatter } from '../../../components/i18n';
import {
  type BasePayload,
  type Command,
  type ContractOutputElement,
  type DnsResolution,
  type Executable,
  type FileDrop,
  type OutputParser,
  type RegexGroup,
} from '../../../utils/api-types';
import CommandsFormTab from './form/CommandsFormTab';
import GeneralFormTab from './form/GeneralFormTab';
import OutputFormTab from './form/OutputFormTab';

type omit = 'payload_type' | 'payload_source' | 'payload_status' | 'payload_created_at' | 'payload_id' | 'payload_updated_at' | 'payload_output_parsers';
type more = {
  payload_output_parsers?: (
  Omit<OutputParser, 'output_parser_created_at' | 'output_parser_updated_at' | 'output_parser_id' | 'output_parser_contract_output_elements'>
  & {
    output_parser_contract_output_elements: (Omit<ContractOutputElement, 'contract_output_element_created_at' | 'contract_output_element_updated_at' | 'contract_output_element_id' | 'contract_output_element_regex_groups'>
      & { contract_output_element_regex_groups: Omit<RegexGroup, 'regex_group_created_at' | 'regex_group_updated_at' | 'regex_group_id'>[] })[];
  }
  )[];
};
type PayloadCreateInputForm = Omit<BasePayload, omit> & more &
  (
    | Omit<Command, omit> & more & { payload_type: 'Command' }
    | Omit<Executable, omit> & more & { payload_type: 'Executable' }
    | Omit<FileDrop, omit> & more & { payload_type: 'FileDrop' }
    | Omit<DnsResolution, omit> & more & { payload_type: 'DnsResolution' }
    );

interface Props {
  onSubmit: SubmitHandler<PayloadCreateInputForm>;
  handleClose: () => void;
  editing: boolean;
  initialValues?: PayloadCreateInputForm;
}

const PayloadForm = ({
  onSubmit,
  handleClose,
  editing,
  initialValues = {
    // @ts-expect-error because of the discriminated union we need to ignore this ts error
    payload_type: undefined,
    payload_name: '',
    payload_platforms: [],
    payload_description: '',
    command_executor: '',
    command_content: '',
    payload_attack_patterns: [],
    payload_cleanup_command: '',
    payload_cleanup_executor: '',
    executable_file: undefined,
    file_drop_file: '',
    dns_resolution_hostname: '',
    payload_tags: [],
    payload_arguments: [],
    payload_prerequisites: [],
    payload_output_parsers: [],
    payload_execution_arch: 'ALL_ARCHITECTURES',
  },
}: Props) => {
  const { t } = useFormatter();
  const theme = useTheme();
  const tabs = ['General', 'Commands', 'Output'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleActiveTabChange = (_: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const regexGroupObject = z.object({
    ...editing && { regex_group_id: z.string().optional() },
    regex_group_field: z.string().min(1, { message: t('Should not be empty') }),
    regex_group_index_values: z.string().min(1, { message: t('Should not be empty') }),
  });

  const contractOutputElementObject = z.object({
    ...editing && { contract_output_element_id: z.string().optional() },
    contract_output_element_is_finding: z.boolean(),
    contract_output_element_name: z.string().min(1, { message: t('Should not be empty') }),
    contract_output_element_key: z.string().min(1, { message: t('Should not be empty') }),
    contract_output_element_type: z.enum(['text', 'number', 'port', 'portscan', 'ipv4', 'ipv6', 'credentials'], { message: t('Should not be empty') }),
    contract_output_element_tags: z.string().array().optional(),
    contract_output_element_rule: z.string().min(1, { message: t('Should not be empty') }),
    contract_output_element_regex_groups: z.array(regexGroupObject),
  });
  const outputParserObject = z.object({
    ...editing && { output_parser_id: z.string().optional() },
    output_parser_mode: z.enum(['STDOUT', 'STDERR', 'READ_FILE'], { message: t('Should not be empty') }),
    output_parser_type: z.enum(['REGEX'], { message: t('Should not be empty') }),
    output_parser_contract_output_elements: z.array(contractOutputElementObject),
  });

  const payloadPrerequisiteZodObject = z.object({
    executor: z.string().min(1, { message: t('Should not be empty') }),
    get_command: z.string().min(1, { message: t('Should not be empty') }),
    description: z.string().optional(),
    check_command: z.string().optional(),
  });

  const payloadArgumentZodObject = z.object({
    default_value: z.string().nonempty(t('Should not be empty')),
    key: z.string().min(1, { message: t('Should not be empty') }),
    type: z.string().min(1, { message: t('Should not be empty') }),
    description: z.string().optional(),
  });

  const baseSchema = {
    payload_name: z.string().min(1, { message: t('Should not be empty') }).describe('General-tab'),
    payload_description: z.string().optional().describe('General-tab'),
    payload_attack_patterns: z.string().array().optional(),
    payload_tags: z.string().array().optional(),
    payload_platforms: z.enum(['Linux', 'Windows', 'MacOS', 'Container', 'Service', 'Generic', 'Internal', 'Unknown']).array().min(1, { message: t('Should not be empty') }).describe('Commands-tab'),
    payload_execution_arch: z.enum(['x86_64', 'arm64', 'ALL_ARCHITECTURES'], { message: t('Should not be empty') }).describe('Commands-tab'),
    payload_cleanup_command: z.string().optional().describe('Commands-tab'),
    payload_cleanup_executor: z.string().optional(),
    payload_arguments: z.array(payloadArgumentZodObject).optional().describe('Commands-tab'),
    payload_prerequisites: z.array(payloadPrerequisiteZodObject).optional().describe('Commands-tab'),
    payload_output_parsers: z.array(outputParserObject).optional().describe('Output-tab'),
  };

  const commandSchema = z.object({
    ...baseSchema,
    payload_type: z.literal('Command').describe('Commands-tab'),
    command_executor: z.string().min(1, { message: 'Should not be empty' }).describe('Commands-tab'),
    command_content: z.string().min(1, { message: 'Should not be empty' }).describe('Commands-tab'),
  });
  const executableSchema = z.object({
    ...baseSchema,
    payload_type: z.literal('Executable').describe('Commands-tab'),
    executable_file: z.string().optional().describe('Commands-tab'),
  });
  const fileDropSchema = z.object({
    ...baseSchema,
    payload_type: z.literal('FileDrop').describe('Commands-tab'),
    file_drop_file: z.string().min(1, { message: t('Should not be empty') }).describe('Commands-tab'),
  });
  const dnsResolutionSchema = z.object({
    ...baseSchema,
    payload_type: z.literal('DnsResolution').describe('Commands-tab'),
    dns_resolution_hostname: z.string().min(1, { message: t('Should not be empty') }).describe('Commands-tab'),
  });

  const schema = z.discriminatedUnion('payload_type', [commandSchema, executableSchema, fileDropSchema, dnsResolutionSchema])
    .refine(data => !(data.payload_cleanup_command && !data.payload_cleanup_executor), {
      message: 'Should not be empty',
      path: ['payload_cleanup_executor'],
    });

  const methods = useForm<PayloadCreateInputForm>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });
  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  const getTabForField = (fieldName: string): string | undefined => {
    const commandShape = (commandSchema.shape as Record<string, ZodTypeAny>)[fieldName];
    const executableShape = (executableSchema.shape as Record<string, ZodTypeAny>)[fieldName];
    const fileDropShape = (fileDropSchema.shape as Record<string, ZodTypeAny>)[fieldName];
    const dnsResolutionShape = (dnsResolutionSchema.shape as Record<string, ZodTypeAny>)[fieldName];

    const fieldSchema: ZodTypeAny = commandShape || executableShape || fileDropShape || dnsResolutionShape;
    return fieldSchema?.description?.replace('-tab', '');
  };

  const handleSubmitWithoutDefault = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValid = await methods.trigger();
    if (!isValid) {
      const firstErrorField = Object.keys(errors)[0];
      const tabName = getTabForField(firstErrorField);
      if (tabName) setActiveTab(tabName);
    } else {
      handleSubmit(onSubmit)(e);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          gap: theme.spacing(2),
        }}
        id="payloadForm"
        noValidate // disabled tooltip
        onSubmit={handleSubmitWithoutDefault}
      >
        <Tabs
          value={activeTab}
          onChange={handleActiveTabChange}
          aria-label="tabs for payload form"
        >
          {tabs.map(tab => <Tab key={tab} label={tab} value={tab} />)}
        </Tabs>

        {activeTab === 'General' && (
          <GeneralFormTab />
        )}

        {activeTab === 'Commands' && (
          <CommandsFormTab disabledPayloadType={editing} />
        )}

        {activeTab === 'Output' && (
          <OutputFormTab />
        )}

        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: theme.spacing(1),
        }}
        >
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={isSubmitting || !isDirty}
          >
            {editing ? t('Update') : t('Create')}
          </Button>
          <Button
            variant="contained"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t('Cancel')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default PayloadForm;
