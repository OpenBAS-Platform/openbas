import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';
import { z } from 'zod';

import { findEndpoints } from '../../../../actions/assets/endpoint-actions';
import Drawer from '../../../../components/common/Drawer';
import AttackPatternFieldController from '../../../../components/fields/AttackPatternFieldController';
import TextFieldController from '../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../components/i18n';
import {
  type EndpointOutput, type Filter,
  type InjectAssistantInput,
} from '../../../../utils/api-types';
import AssetGroupPopover from '../../assets/asset_groups/AssetGroupPopover';
import AssetGroupsList from '../../assets/asset_groups/AssetGroupsList';
import EndpointPopover from '../../assets/endpoints/EndpointPopover';
import EndpointsList from '../../assets/endpoints/EndpointsList';
import MitreFilter from '../../common/filters/MitreFilter';
import InjectAddAssetGroups from '../../simulations/simulation/injects/asset_groups/InjectAddAssetGroups';
import InjectAddEndpoints from '../../simulations/simulation/injects/endpoints/InjectAddEndpoints';

const useStyles = makeStyles()(theme => ({
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  titleWithButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
  },
  selectTTPsButton: {
    marginLeft: 'auto',
    borderColor: theme.palette.divider,
  },
  TTPMitreContainer: {
    padding: theme.spacing(2),
    overflow: 'scroll',
    height: 'calc(100vh - 120px)', // 120px equal to the header and footer height
  },
  TTPWidgetToolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(1),
    height: '55px',
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: InjectAssistantInput) => void;
}

const ScenarioAssistantDrawer = ({ open, onClose, onSubmit }: Props) => {
  const { t } = useFormatter();
  const { classes } = useStyles();
  const [openMitreFilterDrawer, setOpenMitreFilterDrawer] = useState(false);

  const schema = z.object({
    asset_group_ids: z.string().array().optional(),
    asset_ids: z.string().array().optional(),
    attack_pattern_ids: z.array(z.string()).min(1, { message: t('Should not be empty') }),
    inject_by_ttp_number: z.coerce.number().min(0).max(5),
  }).superRefine((data, ctx) => {
    const hasAssetGroupIds = data.asset_group_ids && data.asset_group_ids.length > 0;
    const hasAssetIds = data.asset_ids && data.asset_ids.length > 0;
    if (!hasAssetGroupIds && !hasAssetIds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('Should have at least one asset or one asset group'),
        path: ['asset_group_ids'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('Should have at least one asset or one asset group'),
        path: ['asset_ids'],
      });
    }
  });

  const methods = useForm<InjectAssistantInput>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      asset_group_ids: [],
      asset_ids: [],
      attack_pattern_ids: [],
      inject_by_ttp_number: 1,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  const onCloseMitreDrawer = () => {
    setOpenMitreFilterDrawer(false);
  };
  const onCloseDrawer = () => {
    reset();
    onClose();
  };

  // -- Assets
  const assetIds = useWatch({
    control,
    name: 'asset_ids',
  }) as string[];
  const [endpoints, setEndpoints] = useState<EndpointOutput[]>([]);
  useEffect(() => {
    if (assetIds.length > 0) {
      findEndpoints(assetIds).then(result => setEndpoints(result.data));
    } else {
      setEndpoints([]);
    }
  }, [assetIds]);
  const onAssetChange = (assetIds: string[]) => setValue('asset_ids', assetIds);
  const removeAsset = (assetId: string) => setValue('asset_ids', assetIds.filter(id => id !== assetId));

  // -- Asset groups
  const assetGroupIds = useWatch({
    control,
    name: 'asset_group_ids',
  }) as string[];
  const onAssetGroupChange = (assetGroupIds: string[]) => setValue('asset_group_ids', assetGroupIds);
  const removeAssetGroup = (assetGroupId: string) => setValue('asset_group_ids', assetGroupIds.filter(id => id !== assetGroupId));

  // -- Attack patterns
  let selectedAttackPatternIds: Set<string> = new Set();
  let isMitreSelectionChanged = false;

  const onUpdateAttackPatternWidget = () => {
    setValue('attack_pattern_ids', Array.from(selectedAttackPatternIds), { shouldDirty: true });
    onCloseMitreDrawer();
  };

  const onClickAttackPattern = (attackPatternId: string) => {
    // Initialize selectedAttackPatternIds
    if (!isMitreSelectionChanged) {
      selectedAttackPatternIds = new Set(getValues('attack_pattern_ids') || []);
    }
    // Toggle the attack pattern selection
    if (selectedAttackPatternIds.has(attackPatternId)) {
      selectedAttackPatternIds.delete(attackPatternId);
    } else {
      selectedAttackPatternIds.add(attackPatternId);
    }
    isMitreSelectionChanged = true;
  };

  return (
    <Drawer
      open={open}
      handleClose={onCloseDrawer}
      title={t('Scenario assistant')}
    >
      <FormProvider {...methods}>
        <form
          noValidate // disabled tooltip
          onSubmit={handleSubmit(onSubmit)}
          className={classes.formContainer}
        >
          <Typography variant="h5">
            {t('Target')}
            *
          </Typography>
          <div>
            <Typography variant="h3">{t('Assets')}</Typography>
            <EndpointsList
              endpoints={endpoints}
              renderActions={endpoint => (
                <EndpointPopover
                  inline
                  endpoint={endpoint}
                  removeFromContextLabel="Remove"
                  onRemoveFromContext={removeAsset}
                />
              )}
            />
            <InjectAddEndpoints
              endpointIds={assetIds}
              onSubmit={onAssetChange}
              errorLabel={errors?.asset_ids?.message ?? null}
            />
          </div>

          <div>
            <Typography variant="h3">{t('Asset groups')}</Typography>
            <AssetGroupsList
              assetGroupIds={assetGroupIds}
              renderActions={assetGroup => (
                <AssetGroupPopover
                  assetGroup={assetGroup}
                  inline
                  onRemoveAssetGroupFromList={removeAssetGroup}
                  removeAssetGroupFromListMessage="Remove"
                  actions={['remove']}
                />
              )}
            />
            <InjectAddAssetGroups
              assetGroupIds={assetGroupIds}
              onSubmit={onAssetGroupChange}
              errorLabel={errors?.asset_group_ids?.message ?? null}
            />
          </div>

          <div className={classes.titleWithButtonContainer}>
            <Typography variant="h5">{t('Scenario coverage')}</Typography>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              className={classes.selectTTPsButton}
              onClick={() => setOpenMitreFilterDrawer(true)}
            >
              {t('Select TTPs')}
            </Button>
          </div>
          <AttackPatternFieldController
            hideAddButton
            name="attack_pattern_ids"
            label={t('Cover the following TTPs')}
            required
          />
          <TextFieldController type="number" label={t('Number of injects by TTP')} name="inject_by_ttp_number" required />
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            style={{ marginLeft: 'auto' }}
            disabled={isSubmitting || !isDirty}
          >
            {t('Create Injects')}
          </Button>
        </form>
        <Drawer
          open={openMitreFilterDrawer}
          handleClose={onCloseMitreDrawer}
          title={t('ATT&CK Matrix')}
          variant="full"
          containerStyle={{
            padding: 0,
            maxHeight: '100%',
          }}
        >
          <>
            <MitreFilter
              className={classes.TTPMitreContainer}
              helpers={{
                handleSwitchMode: () => {},
                handleAddFilterWithEmptyValue: (_: Filter) => { },
                handleAddSingleValueFilter: () => { },
                handleAddMultipleValueFilter: () => { },
                handleChangeOperatorFilters: () => { },
                handleClearAllFilters: () => { },
                handleRemoveFilterByKey: () => { },
              }}
              onClick={data => onClickAttackPattern(data)}
              defaultSelectedAttackPatternIds={getValues('attack_pattern_ids') || []}
            />
            <Paper elevation={2} className={classes.TTPWidgetToolbar}>
              <Button
                variant="contained"
                color="primary"
                onClick={onUpdateAttackPatternWidget}
              >
                {t('Update')}
              </Button>
            </Paper>
          </>
        </Drawer>
      </FormProvider>
    </Drawer>
  );
};
export default ScenarioAssistantDrawer;
