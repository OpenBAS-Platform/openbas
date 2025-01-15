import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDropDownOutlined, ArrowDropUpOutlined, HelpOutlined } from '@mui/icons-material';
import { Avatar, Button, Card, CardContent, CardHeader } from '@mui/material';
import { useTheme } from '@mui/styles';
import * as R from 'ramda';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { TagHelper } from '../../../../../actions/helper';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import { useHelper } from '../../../../../store';
import { Inject } from '../../../../../utils/api-types';
import { tagOptions } from '../../../../../utils/Option';
import { splitDuration } from '../../../../../utils/Time';
import { isEmptyField } from '../../../../../utils/utils';
import { PermissionsContext } from '../../Context';
import InjectDefinition from './InjectDefinition';
import InjectForm from './InjectForm';

interface Props {
  injectContractIcon: React.ReactNode | undefined;
  injectHeaderAction: React.ReactNode;
  injectHeaderTitle: string;
  injectorContractLabel?: string;
  openDetail?: boolean;
  disabled?: boolean;
  isAtomic: boolean;
  inject?: Inject;

  handleClose: () => void;
  drawerRef: string;
  onSubmitInject: (data: Inject) => Promise<void>;
  injectorContractContent: object; // TODO set the type
  // contractContentFields: object; // TODO set the type
  defaultFieldValues: object; // TODO set the type
}

const InjectDetailsForm = ({
  injectContractIcon,
  injectHeaderAction,
  injectHeaderTitle,
  injectorContractLabel = '',

  handleClose,
  drawerRef,

  openDetail = false,
  disabled = false,
  isAtomic,
  inject = {} as Inject,
  injectorContractContent,
  onSubmitInject,
}: Props) => {
  const theme: Theme = useTheme();
  const { t } = useFormatter();
  const { permissions } = useContext(PermissionsContext);
  const [defaultValues, setDefaultValues] = useState({});
  const [openDetails, setOpenDetails] = useState(openDetail);
  const [injectDetailsState, setInjectDetailsState] = useState({});

  const { tagsMap } = useHelper((helper: TagHelper) => ({
    tagsMap: helper.getTagsMap(),
  }));
  const toggleInjectContent = () => {
    if (openDetails) {
      drawerRef.current.scrollTop = 0;
      setOpenDetails(false);
    } else {
      setOpenDetails(true);
    }
  };

  const getInitialValues = () => {
    const duration = splitDuration(inject?.inject_depends_duration || 0);
    const initialValues = {
      ...inject,
      ...inject?.inject_content,
      inject_title: inject?.inject_title ?? injectorContractLabel,
      inject_tags: inject?.inject_tags ? tagOptions(inject.inject_tags, tagsMap) : [],
      inject_depends_duration_days: duration.days,
      inject_depends_duration_hours: duration.hours,
      inject_depends_duration_minutes: duration.minutes,
    };
    // Enrich initialValues with default contract value
    if (injectorContractContent) {
      const builtInFields = [
        'teams',
        'assets',
        'assetgroups',
        'articles',
        'challenges',
        'attachments',
        'expectations',
      ];

      injectorContractContent.fields
        .filter(f => !builtInFields.includes(f.key))
        .forEach((field) => {
          if (!initialValues[field.key]) {
            initialValues[field.key] = field.cardinality === '1'
              ? field.defaultValue?.[0]
              : field.defaultValue;
          }

          // Specific richText type field
          if (
            field.type === 'textarea'
            && field.richText
            && initialValues[field.key]?.length > 0
          ) {
            initialValues[field.key] = initialValues[field.key]
              .replaceAll('<#list challenges as challenge>', '&lt;#list challenges as challenge&gt;')
              .replaceAll('<#list articles as article>', '&lt;#list articles as article&gt;')
              .replaceAll('</#list>', '&lt;/#list&gt;');

          // Specific tuple type field
          } else if (field.type === 'tuple' && initialValues[field.key]) {
            const processValue = (pair: { key: string; value: string }) =>
              pair.value?.includes(`${field.tupleFilePrefix}`)
                ? { type: 'attachment', key: pair.key, value: pair.value.replace(`${field.tupleFilePrefix}`, '') }
                : { ...pair, type: 'text' };

            if (field.cardinality === '1') {
              initialValues[field.key] = processValue(initialValues[field.key]);
            } else {
              initialValues[field.key] = initialValues[field.key].map(processValue);
            }
          }
        });
    }
    return initialValues;
  };

  // TODO
  const onSubmit = async (data) => {
    if (injectorContractContent) {
      const finalData = {};
      const hasArticles = injectorContractContent.fields
        .map(f => f.key)
        .includes('articles');
      if (hasArticles && injectDetailsState.articlesIds) {
        finalData.articles = injectDetailsState.articlesIds;
      }
      const hasChallenges = injectorContractContent.fields
        .map(f => f.key)
        .includes('challenges');
      if (hasChallenges && injectDetailsState.challengesIds) {
        finalData.challenges = injectDetailsState.challengesIds;
      }
      const hasExpectations = injectorContractContent.fields
        .map(f => f.key)
        .includes('expectations');
      if (hasExpectations && injectDetailsState.expectations) {
        finalData.expectations = injectDetailsState.expectations;
      }

      injectorContractContent.fields
        .filter(
          f => !['teams', 'assets', 'assetgroups', 'articles', 'challenges', 'attachments', 'expectations'].includes(
            f.key,
          ),
        )
        .forEach((field) => {
          if (field.type === 'number') {
            finalData[field.key] = parseInt(data[field.key], 10);
          } else if (
            field.type === 'textarea'
            && field.richText
            && data[field.key]
            && data[field.key].length > 0
          ) {
            const regex = /&lt;#list\s+(\w+)\s+as\s+(\w+)&gt;/g;
            finalData[field.key] = data[field.key]
              .replace(regex, (_, listName, identifier) => `<#list ${listName} as ${identifier}>`)
              .replaceAll('&lt;/#list&gt;', '</#list>');
          } else if (data[field.key] && field.type === 'tuple') {
            if (field.cardinality && field.cardinality === '1') {
              if (finalData[field.key].type === 'attachment') {
                finalData[field.key] = {
                  key: data[field.key].key,
                  value: `${field.tupleFilePrefix}${data[field.key].value}`,
                };
              } else {
                finalData[field.key] = R.dissoc('type', data[field.key]);
              }
            } else {
              finalData[field.key] = data[field.key].map((pair) => {
                if (pair.type === 'attachment') {
                  return {
                    key: pair.key,
                    value: `${field.tupleFilePrefix}${pair.value}`,
                  };
                }
                return R.dissoc('type', pair);
              });
            }
          } else {
            finalData[field.key] = data[field.key];
          }
        });

      const { allTeams, teamsIds, assetIds, assetGroupIds, documents } = injectDetailsState;
      const inject_depends_duration = data.inject_depends_duration_days * 3600 * 24
        + data.inject_depends_duration_hours * 3600
        + data.inject_depends_duration_minutes * 60;
      const values = {
        inject_title: data.inject_title,
        inject_injector_contract: injectorContractContent.contract_id,
        inject_description: data.inject_description,
        inject_tags: data.inject_tags,
        inject_content: isEmptyField(finalData) ? null : finalData,
        inject_all_teams: allTeams,
        inject_teams: teamsIds,
        inject_assets: assetIds,
        inject_asset_groups: assetGroupIds,
        inject_documents: documents,
        inject_depends_duration,
        inject_depends_on: data.inject_depends_on ? data.inject_depends_on : [],
      };
      await onSubmitInject(values);
    }
    handleClose();
  };

  const {
    reset,
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    resolver: zodResolver(
      z.object({
        inject_title: z.string().min(1, { message: t('This field is required.') }),
        inject_depends_duration_days: z.number().int().min(0, { message: t('This field is required.') }),
        inject_depends_duration_hours: z.number().int().min(0, { message: t('This field is required.') }),
        inject_depends_duration_minutes: z.number().int().min(0, { message: t('This field is required.') }),
        ...Object.keys(defaultValues).reduce((acc, key) => {
          acc[key] = z.any();
          return acc;
        }, {}),
      })),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    const initialValues = getInitialValues();
    setDefaultValues(initialValues);
    reset(initialValues, { keepDirtyValues: true });
  }, [injectorContractContent]);

  return (
    <>
      <div>NEW INJECT DETAILS</div>
      <Card elevation={0}>
        <CardHeader
          sx={{ backgroundColor: theme.palette.background.default }}
          avatar={injectContractIcon ?? <Avatar sx={{ width: 24, height: 24 }}><HelpOutlined /></Avatar>}
          title={injectHeaderTitle}
          action={injectHeaderAction}
        />
        <CardContent sx={{
          fontSize: 18,
          textAlign: 'center',
          ...disabled && { color: theme.palette?.text?.disabled },
          ...disabled && { fontStyle: 'italic' },
        }}
        >
          {injectorContractLabel}
        </CardContent>
      </Card>
      <form id="injectContentForm" onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 10 }}>
        <InjectForm control={control} disabled={disabled} isAtomic={isAtomic} register={register} />
        {injectorContractContent && (
          <div style={{ marginTop: 20 }}>
            {openDetails && (
              <InjectDefinition
                control={control}
                register={register}
                values={getValues()}
                setValue={setValue}
                getValues={key => getValues(key)}
                submitting={isSubmitting}
                inject={defaultValues}
                // TODO create inject default fields for creation
                // inject={{
                //   inject_injector_contract: {
                //     injector_contract_id: contractId,
                //     injector_contract_arch: contract.injector_contract_arch,
                //   },
                //   inject_type: contractContent.config.type,
                //   inject_teams: [],
                //   inject_assets: [],
                //   inject_asset_groups: [],
                //   inject_documents: [],
                // }}
                injectorContract={{ ...injectorContractContent }}
                handleClose={handleClose}
                tagsMap={tagsMap}
                readOnly={permissions.readOnly}
                articlesFromExerciseOrScenario={[]}
                variablesFromExerciseOrScenario={[]}

                setInjectDetailsState={setInjectDetailsState}
                uriVariable=""
                allUsersNumber={0}
                usersNumber={0}
                teamsUsers={[]}
                isAtomic={isAtomic}
              />
            )}
            <div
              style={{
                width: '100%',
                height: 40,
                textTransform: 'uppercase',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                cursor: 'pointer',
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
              onClick={toggleInjectContent}
            >
              {openDetails ? <ArrowDropUpOutlined fontSize="large" /> : <ArrowDropDownOutlined fontSize="large" />}
              {t('Inject content')}
            </div>
          </div>
        )}
        <div style={{ float: 'right', marginTop: 20 }}>
          <Button
            variant="contained"
            onClick={handleClose}
            style={{ marginRight: 10 }}
            disabled={isSubmitting}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0 || disabled}
          >
            {t('Update')}
          </Button>
        </div>
      </form>
    </>
  );
};

export default InjectDetailsForm;
