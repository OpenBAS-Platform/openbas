import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDropDownOutlined, ArrowDropUpOutlined, HelpOutlined } from '@mui/icons-material';
import { Avatar, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type ReactNode, type RefObject, useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  type ContractElement,
  type FieldValue,
  type InjectorContractConverted,
} from '../../../../../actions/injector_contracts/InjectorContract';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type Article, type Inject, type InjectInput, type Variable } from '../../../../../utils/api-types';
import { splitDuration } from '../../../../../utils/Time';
import { PermissionsContext } from '../../Context';
import InjectCardComponent from '../InjectCardComponent';
import InjectContentForm from './InjectContentForm';
import InjectGlobalInfosForm from './InjectGlobalInfosForm';

type InjectInputForm = Omit<InjectInput, 'inject_depends_duration'> & {
  inject_depends_duration_days: number;
  inject_depends_duration_hours: number;
  inject_depends_duration_minutes: number;
};

interface Props {
  injectContractIcon: ReactNode | undefined;
  injectHeaderAction: ReactNode;
  injectHeaderTitle: string;
  injectorContractLabel?: string;
  handleClose: () => void;
  openDetail?: boolean;
  disabled?: boolean;
  isAtomic: boolean;
  isCreation?: boolean;
  drawerRef: RefObject<HTMLDivElement | null>;
  defaultInject: Inject | Omit<Inject, 'inject_id' | 'inject_created_at' | 'inject_updated_at'>;
  onSubmitInject: (data: InjectInput) => Promise<void>;
  injectorContractContent?: InjectorContractConverted['convertedContent'];
  allUsersNumber: number;
  usersNumber: number;
  uriVariable: string;
  variablesFromExerciseOrScenario: Variable[];
  articlesFromExerciseOrScenario: Article[];
}

const InjectForm = ({
  injectContractIcon,
  injectHeaderAction,
  injectHeaderTitle,
  injectorContractLabel = '',
  handleClose,
  openDetail = false,
  disabled = false,
  isAtomic,
  isCreation = false,
  drawerRef,
  defaultInject = {} as Inject,
  injectorContractContent,
  onSubmitInject,
  allUsersNumber,
  usersNumber,
  uriVariable,
  variablesFromExerciseOrScenario,
  articlesFromExerciseOrScenario,
}: Props) => {
  const theme = useTheme();
  const { t } = useFormatter();
  const { permissions } = useContext(PermissionsContext);
  const [defaultValues, setDefaultValues] = useState({});
  const [openDetails, setOpenDetails] = useState(openDetail);
  const notDynamicFields = [
    'teams',
    'assets',
    'assetgroups',
    'articles',
    'challenges',
    'attachments',
    'expectations',
  ];

  const toggleInjectContent = () => {
    if (openDetails && drawerRef.current) {
      drawerRef.current.scrollTop = 0;
    }
    setOpenDetails(!openDetails);
  };

  const getInitialValues = (): Record<string, FieldValue> => {
    const duration = splitDuration(defaultInject?.inject_depends_duration || 0);
    const initialValues = {
      ...defaultInject,
      inject_content: (defaultInject?.inject_content ?? {}) as Record<string, FieldValue>,
      inject_tags: defaultInject?.inject_tags || [],
      inject_depends_duration_days: duration.days,
      inject_depends_duration_hours: duration.hours,
      inject_depends_duration_minutes: duration.minutes,
    };

    // Enrich initialValues with default contract value
    if (injectorContractContent) {
      injectorContractContent.fields
        .filter(f => !notDynamicFields.includes(f.key))
        .forEach((field: ContractElement) => {
          if (!initialValues.inject_content[field.key]) {
            initialValues.inject_content = {
              ...initialValues.inject_content,
              [field.key]: field.cardinality === '1' ? field.defaultValue?.[0] : field.defaultValue,
            };
          }

          // Specific richText type field
          if (
            field.type === 'textarea'
            && field.richText
          ) {
            initialValues.inject_content[field.key] = (initialValues.inject_content[field.key] as string)
              .replaceAll('<#list challenges as challenge>', '&lt;#list challenges as challenge&gt;')
              .replaceAll('<#list articles as article>', '&lt;#list articles as article&gt;')
              .replaceAll('</#list>', '&lt;/#list&gt;');
          }
        });
    }
    return initialValues;
  };

  const formatInjectContentData = (content: Record<string, FieldValue>): object | null => {
    const formattedContent = { ...content };
    injectorContractContent?.fields
      .filter(f => !notDynamicFields.includes(f.key))
      .forEach((field) => {
        if (field.type === 'number' && typeof formattedContent[field.key] === 'string') {
          formattedContent[field.key] = parseInt(formattedContent[field.key].toString(), 10);

        // Specific richText type field
        } else if (
          field.type === 'textarea'
          && field.richText
          && (String(formattedContent[field.key]))?.length > 0
        ) {
          const regex = /&lt;#list\s+(\w+)\s+as\s+(\w+)&gt;/g;
          formattedContent[field.key] = (formattedContent[field.key] as string)
            .replace(regex, (_, listName, identifier) => `<#list ${listName} as ${identifier}>`)
            .replaceAll('&lt;/#list&gt;', '</#list>');
        }
      });
    return formattedContent;
  };

  const onSubmit = async (data: Record<string, FieldValue>) => {
    if (injectorContractContent) {
      const inject_depends_duration = Number(data.inject_depends_duration_days) * 3600 * 24
        + Number(data.inject_depends_duration_hours) * 3600
        + Number(data.inject_depends_duration_minutes) * 60;
      const values = {
        inject_title: data.inject_title,
        inject_injector_contract: injectorContractContent.contract_id,
        inject_description: data.inject_description as string,
        inject_tags: data.inject_tags,
        inject_content: formatInjectContentData(data.inject_content as Record<string, FieldValue>),
        inject_all_teams: data.inject_all_teams,
        inject_teams: data.inject_all_teams ? [] : data.inject_teams,
        inject_assets: data.inject_assets,
        inject_asset_groups: data.inject_asset_groups,
        inject_documents: data.inject_documents,
        inject_depends_duration,
        inject_depends_on: data.inject_depends_on ? data.inject_depends_on : [],
      } as InjectInput;
      await onSubmitInject(values);
    }
    handleClose();
  };

  const strictKeys = {
    inject_title: z.string().min(1, { message: t('This field is required.') }),
    inject_depends_duration_days: z.number().int().min(1, { message: t('This field is required.') }).optional(),
    inject_depends_duration_hours: z.number().int().min(1, { message: t('This field is required.') }).optional(),
    inject_depends_duration_minutes: z.number().int().min(1, { message: t('This field is required.') }).optional(),
  };

  const methods = useForm<InjectInputForm>({
    mode: 'all',
    resolver: zodResolver(z.object({
      ...strictKeys,
      ...Object.keys(defaultValues).reduce<Record<string, z.ZodTypeAny>>((acc, key) => {
        if (!(key in strictKeys)) acc[key] = z.any();
        return acc;
      }, {}),
    })),
    defaultValues: defaultValues,
  });

  const { handleSubmit, reset, formState: { isDirty, isSubmitting, errors } } = methods;

  useEffect(() => {
    const initialValues = getInitialValues();
    setDefaultValues(initialValues);
    setOpenDetails(false);
    reset(initialValues);
  }, [injectorContractContent]);

  if (Object.keys(defaultValues).length === 0) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <form
        id="injectForm"
        noValidate // disabled tooltip
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(2),
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <InjectCardComponent
          avatar={injectContractIcon ?? (
            <Avatar sx={{
              width: 24,
              height: 24,
            }}
            >
              <HelpOutlined />
            </Avatar>
          )}
          title={injectHeaderTitle}
          action={injectHeaderAction}
          content={injectorContractLabel}
          disabled={disabled}
        />
        <InjectGlobalInfosForm isAtomic={isAtomic} readOnly={isSubmitting || disabled || permissions.readOnly} />
        {injectorContractContent && openDetails && (
          <InjectContentForm
            injectorContractContent={injectorContractContent}
            readOnly={isSubmitting || disabled || permissions.readOnly}
            isAtomic={isAtomic}
            allUsersNumber={allUsersNumber}
            allEnabledUsers={usersNumber}
            uriVariable={uriVariable}
            variables={variablesFromExerciseOrScenario}
            articles={articlesFromExerciseOrScenario}
          />
        )}
        { injectorContractContent && (
          <Button
            variant="outlined"
            onClick={toggleInjectContent}
            style={{
              width: '100%',
              height: theme.spacing(5),
            }}
          >
            {openDetails ? <ArrowDropUpOutlined fontSize="large" /> : <ArrowDropDownOutlined fontSize="large" />}
            {t('Inject content')}
          </Button>
        )}
        <div style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: theme.spacing(1),
        }}
        >
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={isSubmitting || !isDirty || disabled || permissions.readOnly}
          >
            {isCreation ? t('Create') : t('Update')}
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

export default InjectForm;
