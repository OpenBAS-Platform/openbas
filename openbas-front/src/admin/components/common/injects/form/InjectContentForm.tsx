import { HelpOutlineOutlined, RotateLeftOutlined } from '@mui/icons-material';
import { Button, IconButton, InputLabel, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { findEndpoints } from '../../../../../actions/assets/endpoint-actions';
import type { ContractVariable } from '../../../../../actions/contract/contract';
import SwitchFieldController from '../../../../../components/fields/SwitchFieldController';
import { useFormatter } from '../../../../../components/i18n';
import type { Article, EndpointOutput, Variable } from '../../../../../utils/api-types';
import { type ContractElement, type EnhancedContractElement } from '../../../../../utils/api-types-custom';
import AssetGroupPopover from '../../../assets/asset_groups/AssetGroupPopover';
import AssetGroupsList from '../../../assets/asset_groups/AssetGroupsList';
import EndpointPopover from '../../../assets/endpoints/EndpointPopover';
import EndpointsList from '../../../assets/endpoints/EndpointsList';
import InjectAddAssetGroups from '../../../simulations/simulation/injects/asset_groups/InjectAddAssetGroups';
import InjectAddEndpoints from '../../../simulations/simulation/injects/endpoints/InjectAddEndpoints';
import AvailableVariablesDialog from '../../../simulations/simulation/variables/AvailableVariablesDialog';
import type { ExpectationInput } from '../expectations/Expectation';
import InjectExpectations from '../expectations/InjectExpectations';
import InjectArticlesList from './articles/InjectArticlesList';
import InjectChallengesList from './challenges/InjectChallengesList';
import InjectDocumentsList from './documents/InjectDocumentsList';
import InjectContentFieldComponent from './InjectContentFieldComponent';
import InjectTeamsList from './teams/InjectTeamsList';

interface Props {
  enhancedFields: EnhancedContractElement[];
  enhancedFieldsMapByType: Map<ContractElement['type'], EnhancedContractElement>;
  injectorContractVariables: ContractVariable[];
  isAtomic: boolean;
  isCreation: boolean;
  readOnly?: boolean;
  articles?: Article[];
  uriVariable?: string;
  variables?: Variable[];
}

const InjectContentForm = ({
  enhancedFields,
  enhancedFieldsMapByType,
  injectorContractVariables,
  isAtomic,
  isCreation,
  readOnly,
  articles = [],
  uriVariable = '',
  variables = [],
}: Props) => {
  const { t } = useFormatter();
  const theme = useTheme();
  const { control, setValue, getValues, trigger, formState: { errors } } = useFormContext();

  const renderTitle = (title: string, required: boolean = false, err: boolean = false) => {
    return (
      <Typography variant="h5" color={err ? 'error' : 'textPrimary'}>
        {title}
        {required ? '*' : '' }
      </Typography>
    );
  };

  // -- TEAMS --
  const renderTeams = (err?: string | null) => (
    <InjectTeamsList
      readOnly={enhancedFieldsMapByType.get('team')?.readOnly || readOnly}
      hideEnabledUsersNumber={isAtomic}
      error={err}
    />
  );

  // -- ASSETS --
  const injectAssetIds = useWatch({
    control,
    name: 'inject_assets',
  }) as string[];
  const [injectAssets, setInjectAssets] = useState<EndpointOutput[]>([]);
  useEffect(() => {
    if (enhancedFieldsMapByType.has('asset') && injectAssetIds.length > 0) {
      findEndpoints(injectAssetIds).then(result => setInjectAssets(result.data));
    } else {
      setInjectAssets([]);
    }
  }, [injectAssetIds]);

  const onAssetChange = (assetIds: string[]) => setValue('inject_assets', assetIds, { shouldValidate: true });
  const removeAsset = (assetId: string) => setValue('inject_assets', injectAssetIds.filter(id => id !== assetId), { shouldValidate: true });

  const renderAssets = (err?: string | null, isInMandatoryGroup?: boolean, mandatoryGroupContractElementLabels?: string) => (
    <div key="asset">
      <InputLabel required={enhancedFieldsMapByType.get('asset')?.settings?.required} error={!!err}>{t(enhancedFieldsMapByType.get('asset')?.label || 'Assets')}</InputLabel>
      <EndpointsList
        compact
        endpoints={injectAssets}
        renderActions={endpoint => (
          <EndpointPopover
            inline
            agentless={endpoint.asset_agents.length === 0}
            endpoint={endpoint}
            onRemoveFromContext={removeAsset}
            removeFromContextLabel="Remove from the inject"
            onDelete={removeAsset}
            disabled={enhancedFieldsMapByType.get('asset')?.readOnly || readOnly}
          />
        )}
      />
      <InjectAddEndpoints
        endpointIds={injectAssetIds}
        onSubmit={onAssetChange}
        platforms={getValues('inject_injector_contract.injector_contract_platforms')}
        payloadArch={getValues('inject_injector_contract.injector_contract_arch')}
        disabled={enhancedFieldsMapByType.get('asset')?.readOnly || readOnly}
        errorLabel={err && isInMandatoryGroup ? t('At least one is required ({labels})', { labels: mandatoryGroupContractElementLabels || '' }) : err}
        label={isInMandatoryGroup && t('At least one is required ({labels})', { labels: mandatoryGroupContractElementLabels || '' })}
      />
    </div>
  );

  // -- ASSETS GROUPS --
  const injectAssetGroupIds = useWatch({
    control,
    name: 'inject_asset_groups',
  }) as string[];
  const onAssetGroupChange = (assetGroupIds: string[]) => setValue('inject_asset_groups', assetGroupIds, { shouldValidate: true });
  const removeAssetGroup = (assetGroupId: string) => setValue('inject_asset_groups', injectAssetGroupIds.filter(id => id !== assetGroupId), { shouldValidate: true });

  const renderAssetGroups = (err?: string | null, isInMandatoryGroup?: boolean, mandatoryGroupContractElementLabels?: string) => (
    <div key="asset-group">
      <InputLabel required={enhancedFieldsMapByType.get('asset-group')?.settings?.required} error={!!err}>{t(enhancedFieldsMapByType.get('asset-group')?.label || 'Asset groups')}</InputLabel>
      <AssetGroupsList
        assetGroupIds={injectAssetGroupIds}
        renderActions={assetGroup => (
          <AssetGroupPopover
            disabled={enhancedFieldsMapByType.get('asset-group')?.readOnly || readOnly}
            assetGroup={assetGroup}
            inline
            onRemoveAssetGroupFromList={removeAssetGroup}
          />
        )}
      />
      <InjectAddAssetGroups
        disabled={enhancedFieldsMapByType.get('asset-group')?.readOnly || readOnly}
        assetGroupIds={injectAssetGroupIds}
        onSubmit={onAssetGroupChange}
        errorLabel={err && isInMandatoryGroup ? t('At least one is required ({labels})', { labels: mandatoryGroupContractElementLabels || '' }) : err}
        label={isInMandatoryGroup && t('At least one is required ({labels})', { labels: mandatoryGroupContractElementLabels || '' })}
      />
    </div>
  );

  // -- ARTICLES --
  const renderArticles = () => (
    <InjectArticlesList
      allArticles={articles}
      readOnly={enhancedFieldsMapByType.get('article')?.readOnly || readOnly}
    />
  );

  // -- CHALLENGES --
  const renderChallenges = () => <InjectChallengesList readOnly={enhancedFieldsMapByType.get('challenge')?.readOnly || readOnly} />;

  // -- EXPECTATIONS --
  const injectExpectations = useWatch({
    control,
    name: 'inject_content.expectations',
  }) as ExpectationInput[];
  const predefinedExpectations: ExpectationInput[] = enhancedFields
    .filter(n => n.type === 'expectation')
    .flatMap(f => f.predefinedExpectations ?? []);
  const onExpectationChange = (expectationIds: ExpectationInput[]) => setValue('inject_content.expectations', expectationIds, { shouldValidate: true });

  const renderExpectations = () => (
    <InjectExpectations
      predefinedExpectationDatas={predefinedExpectations}
      expectationDatas={injectExpectations}
      handleExpectations={onExpectationChange}
      readOnly={enhancedFieldsMapByType.get('expectation')?.readOnly || readOnly}
    />
  );

  // -- DOCUMENTS --
  const renderDocuments = () => (
    <InjectDocumentsList
      hasAttachments={enhancedFieldsMapByType.has('attachment')}
      readOnly={enhancedFieldsMapByType.get('attachment')?.readOnly || readOnly}
    />
  );

  // -- DYNAMIC FIELDS --
  const [openVariables, setOpenVariables] = useState(false);
  const openVariablesDialog = () => setOpenVariables(true);
  const dynamicFields = enhancedFields.filter(field => field.isInjectContentType || field.type === 'asset-group' || field.type === 'asset');

  const resetDefaultValue = () => {
    dynamicFields
      .forEach((field) => {
        let defaultValue = field.cardinality === '1' ? (field.defaultValue?.[0] || '') : field.defaultValue;
        if (
          field.type === 'textarea'
          && field.richText
          && defaultValue
          && defaultValue.length > 0
        ) {
          defaultValue = (defaultValue as string ?? '').replaceAll('<#list challenges as challenge>', '&lt;#list challenges as challenge&gt;')
            .replaceAll('<#list articles as article>', '&lt;#list articles as article&gt;')
            .replaceAll('</#list>', '&lt;/#list&gt;');
        }
        setValue(field.key, defaultValue);
      });
  };

  const renderDynamicFields = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    }}
    >
      {
        (dynamicFields ?? []).filter(field => field.isVisible).map((field) => {
          if (field.type === 'asset') {
            const key = enhancedFieldsMapByType.get('asset')?.key;
            return renderAssets(key ? errors[key]?.message as string : null, enhancedFieldsMapByType.get('asset')?.isInMandatoryGroup, enhancedFieldsMapByType.get('asset')?.mandatoryGroupContractElementLabels);
          } else if (field.type === 'asset-group') {
            const key = enhancedFieldsMapByType.get('asset-group')?.key;
            return renderAssetGroups(key ? errors[key]?.message as string : null, enhancedFieldsMapByType.get('asset-group')?.isInMandatoryGroup, enhancedFieldsMapByType.get('asset-group')?.mandatoryGroupContractElementLabels);
          }

          return (
            <InjectContentFieldComponent
              key={field.key}
              field={field}
              readOnly={readOnly || field.readOnly}
            />
          );
        })
      }
    </div>
  );

  const injectContentParts = [
    {
      key: 'teams',
      title: () => renderTitle(t('Targeted teams'), enhancedFieldsMapByType.get('team')?.settings?.required, !!errors[enhancedFieldsMapByType.get('team')!.key]),
      renderRightButton: !isAtomic && (
        <SwitchFieldController
          name="inject_all_teams"
          label={<strong>{t('All teams')}</strong>}
          disabled={enhancedFieldsMapByType.get('team')?.readOnly || readOnly}
          size="small"
        />
      ),
      render: () => renderTeams(errors[enhancedFieldsMapByType.get('team')!.key]?.message as string || null),
      show: enhancedFieldsMapByType.has('team'),
    },
    {
      key: 'media_pressure',
      title: () => renderTitle(t('Media pressure to publish'), enhancedFieldsMapByType.get('article')?.settings?.required),
      render: renderArticles,
      show: enhancedFieldsMapByType.has('article') && enhancedFieldsMapByType.get('article')?.isVisible,
    },
    {
      key: 'challenge',
      title: () => renderTitle(t('Challenges to publish'), enhancedFieldsMapByType.get('challenge')?.settings?.required),
      render: renderChallenges,
      show: enhancedFieldsMapByType.has('challenge') && enhancedFieldsMapByType.get('challenge')?.isVisible,
    },
    {
      key: 'inject_data_title',
      title: () => <Typography variant="h5" style={{ marginTop: 0 }}>{t('Inject data')}</Typography>,
      parentStyle: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(-1),
      },
      renderLeftButton: (
        <Tooltip title={t('Reset to default values')}>
          <IconButton
            color="primary"
            disabled={enhancedFieldsMapByType.get('expectation')?.readOnly || readOnly}
            onClick={resetDefaultValue}
            size="small"
          >
            <RotateLeftOutlined />
          </IconButton>
        </Tooltip>
      ),
      renderRightButton: (
        <Button
          color="primary"
          startIcon={<HelpOutlineOutlined />}
          variant="outlined"
          size="small"
          onClick={openVariablesDialog}
        >
          {t('Available variables')}
        </Button>
      ),
      show: dynamicFields.length,
    },
    {
      key: 'inject_data',
      render: renderDynamicFields,
      show: true,
    },
    {
      key: 'expectations',
      title: () => renderTitle(t('Inject expectations'), enhancedFieldsMapByType.get('expectation')?.settings?.required),
      render: renderExpectations,
      show: enhancedFieldsMapByType.has('expectation') && enhancedFieldsMapByType.get('expectation')?.isVisible,
    },
    {
      key: 'documents',
      title: () => renderTitle(t('Inject documents'), enhancedFieldsMapByType.get('attachment')?.settings?.required),
      render: renderDocuments,
      show: !isAtomic && enhancedFieldsMapByType.has('attachment') && enhancedFieldsMapByType.get('attachment')?.isVisible,
    },
  ];

  const triggerInitialValidation = () => {
    useEffect(() => {
      if (!isCreation) {
        trigger();
      }
    }, []);
  };

  return (
    <>
      {injectContentParts.filter(part => part.show).map(part => (
        <div
          key={part.key}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            ...part.parentStyle,
          }}
        >
          {part.title && part.title()}
          {part.renderLeftButton}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          >
            {part.renderRightButton}
          </div>
          {
            part.render
            && (
              <div style={{ width: '100%' }}>
                {part.render()}
              </div>
            )
          }
        </div>
      ))}
      {triggerInitialValidation()}
      <AvailableVariablesDialog
        uriVariable={uriVariable}
        variables={variables}
        open={openVariables}
        handleClose={() => setOpenVariables(false)}
        variablesFromInjectorContract={injectorContractVariables ?? []}
      />
    </>
  );
};

export default InjectContentForm;
