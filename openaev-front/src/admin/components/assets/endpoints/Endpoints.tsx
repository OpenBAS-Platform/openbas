import { Checkbox } from '@filigran/design-system';
import { HelpOutlineOutlined } from '@mui/icons-material';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { ASSET_TYPE, assetQueries } from '../../../../actions/assets/asset-queries';
import { bulkDeleteAssets } from '../../../../actions/assets/endpoint-actions';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import ExportButton from '../../../../components/common/ExportButton';
import AssetPlatformFragment from '../../../../components/common/list/fragments/AssetPlatformFragment';
import EndpointActiveFragment from '../../../../components/common/list/fragments/EndpointActiveFragment';
import { initSorting } from '../../../../components/common/queryable/Page';
import PaginationToolbar from '../../../../components/common/queryable/pagination/PaginationToolbar';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import { useFormatter } from '../../../../components/i18n';
import ItemCriticality from '../../../../components/ItemCriticality';
import ItemMarkings from '../../../../components/ItemMarkings';
import ItemTags from '../../../../components/ItemTags';
import PaginatedListLoader from '../../../../components/PaginatedListLoader';
import { ASSET_BASE_URL } from '../../../../constants/BaseUrls';
import { type EndpointOutput } from '../../../../utils/api-types';
import useEntityToggle from '../../../../utils/hooks/useEntityToggle';
import useMarkingDefinitions from '../../../../utils/hooks/useMarkingDefinitions';
import { Can, useAbility } from '../../../../utils/permissions/permissionsContext';
import { ACTIONS, SUBJECTS } from '../../../../utils/permissions/types';
import { useLiveMutation } from '../../../../utils/query/live';
import { isFeatureEnabled } from '../../../../utils/utils';
import EndpointListItemFragments from '../../common/endpoints/EndpointListItemFragments';
import EndpointAgentsExecutorsFragment from '../../common/endpoints/fragments/EndpointAgentsExecutorsFragment';
import ToolBar from '../../common/ToolBar';
import { humanizeEnum } from '../asset-categories';
import AssetCategoryIcon from '../AssetCategoryIcon';
import PostureScoreCell from '../PostureScoreCell';
import { usePostureScoresQuery } from '../usePostureScores';
import AssetActionDialogs, { type EditableAsset } from './AssetActionDialogs';
import AssetPopover from './AssetPopover';
import EndpointCreation from './EndpointCreation';
import ImportUploaderEndpoints from './ImportUploaderEndpoints';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

const inlineStyles: Record<string, CSSProperties> = {
  asset_name: { width: '20%' },
  asset_category: { width: '12%' },
  endpoint_active: { width: '9%' },
  endpoint_platform: { width: '9%' },
  endpoint_agents_executor: { width: '12%' },
  asset_criticality: { width: '9%' },
  asset_posture: { width: '10%' },
  asset_tags: { width: '10%' },
  asset_markings: { width: '9%' },
};

// Rows of the previous page shown while the next one loads: dimmed and inert to the pointer.
const stalePageSx = {
  opacity: 0.5,
  pointerEvents: 'none',
} as const;

const Endpoints = () => {
  // Standard hooks
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();
  const { t } = useFormatter();
  // Gates the Markings column/filter (and the data fetch below) so a flag-off or unauthorized
  // platform looks exactly as it did before this feature — mirrors the settings.config.tsx pattern
  // used for the Marking Definitions menu.
  const markingEnabled = isFeatureEnabled('MARKING');
  const ability = useAbility();
  const canAccessMarkings = markingEnabled && ability.can(ACTIONS.ACCESS, SUBJECTS.MARKING_DEFINITION);
  // Resolved once for the whole page; the Markings column maps ids per row. Skipped entirely when
  // either gate is closed so the platform issues no marking-definitions request at all.
  const markingDefinitions = useMarkingDefinitions({
    skip: !canAccessMarkings,
    assignableOnly: true,
  });

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');

  // Base Asset facets only: the unified inventory queries the base assets table, so endpoint-only
  // fields (platform / arch) cannot be resolved as filters here (single-table inheritance).
  const availableFilterNames = [
    'asset_category',
    'asset_subcategory',
    'asset_status',
    'asset_criticality',
    'asset_cloud_provider',
    'asset_internet_facing',
    'asset_tags',
    ...(canAccessMarkings ? ['asset_markings'] : []),
  ];

  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('asset', buildSearchPagination({
    sorts: initSorting('asset_name'),
    textSearch: search,
  }));

  // The rows are a live query: creations, edits, deletions and agent changes (here or elsewhere)
  // refresh it. The previous page stays on screen, dimmed and not selectable, while a new page,
  // sort or filter loads (placeholder data).
  const { data: page, isPending, isPlaceholderData } = useQuery({
    ...assetQueries.list(searchPaginationInput),
    placeholderData: keepPreviousData,
  });
  const endpoints = page?.content ?? [];
  const totalElements = page?.totalElements ?? 0;

  // Export
  const exportProps = {
    exportType: 'ENDPOINTS',
    exportKeys: [],
    exportData: endpoints,
    exportFileName: `${t('Endpoints')}.csv`,
    searchPaginationInput: searchPaginationInput,
  };

  // Bulk selection
  const canManage = ability.can(ACTIONS.MANAGE, SUBJECTS.ASSETS);
  const {
    selectedElements,
    deSelectedElements,
    selectAll,
    handleClearSelectedElements,
    handleToggleSelectAll,
    onToggleEntity,
    setSelectedElements,
    numberOfSelectedElements,
  } = useEntityToggle<EndpointOutput>('asset', endpoints, totalElements);

  // Per-row posture score, batched in a single dashboard-engine query per page.
  const { loading: postureLoading, scores: postureScores } = usePostureScoresQuery(
    'base_asset_side',
    endpoints.map(endpoint => endpoint.asset_id),
  );

  const bulkDeleteMutation = useLiveMutation({
    mutationFn: bulkDeleteAssets,
    changes: result => (result.data ?? []).map((id: string) => ({
      type: ASSET_TYPE,
      id,
      action: 'delete' as const,
    })),
  });

  // The ids to delete are explicit (or a search input), so the delete is valid whichever page is on
  // screen, including while the placeholder rows of the previous page are shown.
  const bulkDelete = () => {
    bulkDeleteMutation.mutate({
      search_pagination_input: selectAll ? searchPaginationInput : undefined,
      asset_ids_to_process: selectAll ? undefined : Object.keys(selectedElements),
      asset_ids_to_ignore: Object.keys(deSelectedElements),
    }, { onSuccess: handleClearSelectedElements });
  };

  // Selection drift: a live refetch of the same search can drop a row the user had selected (deleted
  // elsewhere, or moved to a neighbouring page). Drop the selected ids that were on the previous
  // settled page and are gone from the new one, so a later bulk delete never targets a stale id.
  // Ids selected on other pages, and select-all mode, are left alone.
  const settledPage = useRef<{
    input: string;
    ids: string[];
  } | null>(null);
  useEffect(() => {
    if (!page || isPlaceholderData) return;
    const previous = settledPage.current;
    const input = JSON.stringify(searchPaginationInput);
    const ids = page.content.map((endpoint: EndpointOutput) => endpoint.asset_id);
    settledPage.current = {
      input,
      ids,
    };
    if (selectAll || previous?.input !== input) return;
    const gone = previous.ids.filter(id => !ids.includes(id) && id in selectedElements);
    if (gone.length > 0) {
      setSelectedElements(Object.fromEntries(Object.entries(selectedElements).filter(([id]) => !gone.includes(id))));
    }
  }, [page, isPlaceholderData]);

  // Update drawer and delete dialog of one row, hosted here rather than in the row's popover: a
  // refetch can move that row to another page and unmount its popover, which would close the
  // drawer and lose the unsaved edits. The asset is kept as it was when the action was chosen.
  const [actionTarget, setActionTarget] = useState<{
    asset: EditableAsset;
    action: 'update' | 'delete' | null;
  } | null>(null);
  const closeAction = () => setActionTarget(target => (target
    ? {
        ...target,
        action: null,
      }
    : null));

  // Headers
  const headers = [
    {
      field: EndpointListItemFragments.ASSET_NAME,
      label: 'Name',
      isSortable: true,
      value: (endpoint: EndpointOutput) => endpoint.asset_name,
    },
    {
      field: 'asset_category',
      label: 'Category',
      isSortable: true,
      value: (endpoint: EndpointOutput) => (
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
        >
          <AssetCategoryIcon category={endpoint.asset_category} fontSize="small" />
          <span style={{
            width: 'fit-content',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          >
            {endpoint.asset_category ? t(humanizeEnum(endpoint.asset_category)) : '-'}
          </span>
        </span>
      ),
    },
    {
      field: EndpointListItemFragments.ENDPOINT_ACTIVE,
      label: 'Status',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <EndpointActiveFragment activity_map={(endpoint.asset_agents ?? []).map(a => a.agent_active ?? false)} />,
    },
    {
      field: EndpointListItemFragments.ENDPOINT_PLATFORM,
      label: 'Platform',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <AssetPlatformFragment platform={endpoint.endpoint_platform} />,
    },
    {
      field: 'endpoint_agents_executor',
      label: 'Executors',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <EndpointAgentsExecutorsFragment endpoint={endpoint} />,
    },
    {
      field: 'asset_criticality',
      label: 'Criticality',
      isSortable: true,
      value: (endpoint: EndpointOutput) => <ItemCriticality criticality={endpoint.asset_criticality} />,
    },
    {
      field: 'asset_posture',
      label: 'Posture score',
      isSortable: false,
      value: (endpoint: EndpointOutput) => (
        <PostureScoreCell
          success={postureScores[endpoint.asset_id]?.success ?? 0}
          failed={postureScores[endpoint.asset_id]?.failed ?? 0}
          loading={postureLoading}
        />
      ),
    },
    {
      field: EndpointListItemFragments.ASSET_TAGS,
      label: 'Tags',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <ItemTags variant="list" tags={endpoint.asset_tags ?? []} />,
    },
    // Rendered only when MARKING is enabled and the user can access marking definitions — with
    // either gate closed, the list must look exactly as it did before this column was added.
    ...(canAccessMarkings
      ? [{
          field: 'asset_markings',
          label: 'Markings',
          // Not sortable: markings are stored as a text[] on the row, not a joinable column.
          isSortable: false,
          value: (endpoint: EndpointOutput) => (
            <ItemMarkings
              variant="list"
              markingIds={endpoint.asset_markings ?? []}
              definitions={markingDefinitions}
            />
          ),
        }]
      : []),
  ];

  return (
    <>
      <Breadcrumbs
        variant="list"
        elements={[{
          label: t('Endpoints'),
          current: true,
        }]}
      />
      <PaginationToolbar
        searchPaginationInput={searchPaginationInput}
        data={page}
        entityPrefix="asset"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
        topBarButtons={(
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            {/* A plain row of actions: this was a ToggleButtonGroup used as a frame,
                which announced a group of choices that never existed. */}
            <Box sx={{
              display: 'flex',
              gap: 1,
            }}
            >
              <ExportButton totalElements={totalElements} exportProps={exportProps} />
              <Can I={ACTIONS.MANAGE} a={SUBJECTS.ASSETS}>
                <ImportUploaderEndpoints />
              </Can>
            </Box>
            <Can I={ACTIONS.MANAGE} a={SUBJECTS.ASSETS}>
              <EndpointCreation agentless={true} />
            </Can>
          </Box>
        )}
      />
      <List aria-busy={isPlaceholderData}>
        <ListItem
          classes={{ root: classes.itemHead }}
          sx={numberOfSelectedElements > 0
            ? {
                // Massive-operations toolbar: symmetric vertical padding keeps the
                // checkbox and actions vertically centered in the accent band.
                backgroundColor: 'background.accent',
                paddingBlock: 0.5,
              }
            : { paddingTop: 0 }}
          {...(numberOfSelectedElements === 0 ? { secondaryAction: <>&nbsp;</> } : {})}
        >
          {canManage && (
            <ListItemIcon style={{ minWidth: 40 }}>
              <Checkbox
                aria-label={t('Select all')}
                checked={selectAll}
                disabled={isPlaceholderData}
                onCheckedChange={handleToggleSelectAll}
              />
            </ListItemIcon>
          )}
          {numberOfSelectedElements > 0 ? (
            <ListItemText
              primary={(
                <ToolBar
                  numberOfSelectedElements={numberOfSelectedElements}
                  handleClearSelectedElements={handleClearSelectedElements}
                  handleBulkDelete={bulkDelete}
                  canManage={canManage}
                  deleteConfirmationSingular={t('Do you want to delete this asset?')}
                  deleteConfirmationPlural={t('Do you want to delete these {count} assets?', { count: String(numberOfSelectedElements) })}
                />
              )}
            />
          ) : (
            <>
              <ListItemIcon />
              <ListItemText
                primary={(
                  <SortHeadersComponentV2
                    headers={headers}
                    inlineStylesHeaders={inlineStyles}
                    sortHelpers={queryableHelpers.sortHelpers}
                  />
                )}
              />
            </>
          )}
        </ListItem>
        {
          isPending
            ? <PaginatedListLoader Icon={HelpOutlineOutlined} headers={headers} headerStyles={inlineStyles} withCheckbox={canManage} />
            : endpoints.map((endpoint: EndpointOutput) => {
                // Every asset type now has a generic detail page, and the popover renders on every
                // row so the secondary-action column stays consistent and the columns stay aligned.
                return (
                  <ListItem
                    key={endpoint.asset_id}
                    divider
                    sx={isPlaceholderData ? stalePageSx : undefined}
                    secondaryAction={(
                      <AssetPopover
                        inline
                        endpoint={{ ...endpoint }}
                        agentless={endpoint.asset_agents?.length === 0}
                        updatable
                        deletable
                        onRequestUpdate={asset => setActionTarget({
                          asset,
                          action: 'update',
                        })}
                        onRequestDelete={asset => setActionTarget({
                          asset,
                          action: 'delete',
                        })}
                      />
                    )}
                    disablePadding
                  >
                    <ListItemButton component={Link} to={`${ASSET_BASE_URL}/${endpoint.asset_id}`} classes={{ root: classes.item }}>
                      {canManage && (
                        <ListItemIcon
                          style={{ minWidth: 40 }}
                          onClick={event => (isPlaceholderData ? event.preventDefault() : onToggleEntity(endpoint, event))}
                        >
                          <Checkbox
                            aria-label={endpoint.asset_name}
                            disabled={isPlaceholderData}
                            checked={
                              (selectAll && !(endpoint.asset_id in (deSelectedElements || {})))
                              || endpoint.asset_id in (selectedElements || {})
                            }
                          />
                        </ListItemIcon>
                      )}
                      <ListItemIcon>
                        <AssetCategoryIcon category={endpoint.asset_category} color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={(
                          <div style={bodyItemsStyles.bodyItems}>
                            {headers.map(header => (
                              <div
                                key={header.field}
                                style={{
                                  ...bodyItemsStyles.bodyItem,
                                  ...inlineStyles[header.field],
                                }}
                              >
                                {header.value(endpoint)}
                              </div>
                            ))}
                          </div>
                        )}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })
        }
      </List>
      {actionTarget && (
        <AssetActionDialogs
          endpoint={actionTarget.asset}
          agentless={actionTarget.asset.asset_agents?.length === 0}
          editing={actionTarget.action === 'update'}
          deleting={actionTarget.action === 'delete'}
          onCloseEdit={closeAction}
          onCloseDelete={closeAction}
        />
      )}
    </>
  );
};

export default Endpoints;
