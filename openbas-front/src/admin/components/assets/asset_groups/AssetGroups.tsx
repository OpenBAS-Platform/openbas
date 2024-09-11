import { makeStyles } from '@mui/styles';
import React, { CSSProperties, useState } from 'react';
import { Chip, Drawer as MuiDrawer, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { SelectGroup } from 'mdi-material-ui';
import { useSearchParams } from 'react-router-dom';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import type { TagHelper, UserHelper } from '../../../../actions/helper';
import type { AssetGroupStore } from './AssetGroup';
import ItemTags from '../../../../components/ItemTags';
import AssetGroupPopover from './AssetGroupPopover';
import AssetGroupCreation from './AssetGroupCreation';
import { searchAssetGroups } from '../../../../actions/asset_groups/assetgroup-action';
import AssetGroupManagement from './AssetGroupManagement';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import type { EndpointHelper } from '../../../../actions/assets/asset-helper';
import type { SearchPaginationInput } from '../../../../utils/api-types';
import { initSorting } from '../../../../components/common/queryable/Page';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';
import { convertOperatorToIcon } from '../../../../components/common/queryable/filter/FilterUtils';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchTags } from '../../../../actions/Tag';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';

const useStyles = makeStyles(() => ({
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItems: {
    display: 'flex',
    alignItems: 'center',
  },
  bodyItem: {
    height: 24,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    alignContent: 'center',
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  asset_group_name: {
    width: '20%',
  },
  asset_group_description: {
    width: '20%',
  },
  asset_group_assets: {
    width: '35%',
    cursor: 'default',
  },
  asset_group_tags: {
    width: '25%',
  },
};

const AssetGroups = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState<AssetGroupStore['asset_group_id'] | undefined>(undefined);

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [searchId] = searchParams.getAll('id');

  // Fetching data
  const { userAdmin } = useHelper((helper: EndpointHelper & UserHelper & TagHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  useDataLoader(() => {
    dispatch(fetchTags());
  });

  // Headers
  const headers = [
    { field: 'asset_group_name', label: 'Name', isSortable: true },
    { field: 'asset_group_description', label: 'Description', isSortable: true },
    { field: 'asset_group_assets', label: 'Rules', isSortable: false },
    { field: 'asset_group_tags', label: 'Tags', isSortable: true },
  ];

  const [assetGroups, setAssetGroups] = useState<AssetGroupStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>(buildSearchPagination({
    sorts: initSorting('asset_group_name'),
    textSearch: search,
  }));

  // Export
  const exportProps = {
    exportType: 'asset_group',
    exportKeys: [
      'asset_group_name',
      'asset_group_description',
      'asset_group_tags',
    ],
    exportData: assetGroups,
    exportFileName: `${t('AssetGroups')}.csv`,
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Assets') }, { label: t('Asset groups'), current: true }]} />
      <PaginationComponent
        fetch={searchAssetGroups}
        searchPaginationInput={searchPaginationInput}
        setContent={setAssetGroups}
        exportProps={exportProps}
      />
      <div className="clearfix" />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon>
            <span
              style={{
                padding: '0 8px 0 8px',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              &nbsp;
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
              />
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {assetGroups.map((assetGroup: AssetGroupStore) => (
          <ListItem
            key={assetGroup.asset_group_id}
            classes={{ root: classes.item }}
            divider
            button
            onClick={() => setSelectedAssetGroupId(assetGroup.asset_group_id)}
          >
            <ListItemIcon>
              <SelectGroup color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div className={classes.bodyItems}>
                  <div className={classes.bodyItem} style={inlineStyles.asset_group_name}>
                    {assetGroup.asset_group_name}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.asset_group_description}>
                    {assetGroup.asset_group_description}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.asset_group_assets}>
                    {assetGroup.asset_group_dynamic_filter?.filters?.length
                      ? assetGroup.asset_group_dynamic_filter?.filters.map((filter, index) => (
                        <>
                          {
                            index !== 0 && <span style={{ marginRight: 10 }}>
                                {t(assetGroup.asset_group_dynamic_filter?.mode?.toUpperCase())}
                              </span>
                          }
                          <Chip
                            size="small"
                            style={index !== assetGroup.asset_group_dynamic_filter?.filters?.length ? { marginRight: 10 } : {}}
                            key={filter.key}
                            label={<><strong>{t(filter.key)}</strong> {convertOperatorToIcon(t, filter.operator)}{' '}{filter.values?.join(', ')}</>}
                          />
                        </>))
                      : ''}
                    {assetGroup.asset_group_assets?.length ? `${assetGroup.asset_group_dynamic_filter?.filters?.length ? t('and') : ''} ${assetGroup.asset_group_assets?.length} ${t('managed assets')}` : ''}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.asset_group_tags}>
                    <ItemTags variant="list" tags={assetGroup.asset_group_tags} />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <AssetGroupPopover
                assetGroup={assetGroup}
                onUpdate={(result) => setAssetGroups(assetGroups.map((ag) => (ag.asset_group_id !== result.asset_group_id ? ag : result)))}
                onDelete={(result) => setAssetGroups(assetGroups.filter((ag) => (ag.asset_group_id !== result)))}
                onRemoveEndpointFromAssetGroup={(assetId) => setAssetGroups(assetGroups.map((ag) => (ag.asset_group_id !== assetGroup.asset_group_id ? ag : {
                  ...ag,
                  asset_group_assets: ag?.asset_group_assets?.toSpliced(ag?.asset_group_assets?.indexOf(assetId), 1),
                })))}
                openEditOnInit={assetGroup.asset_group_id === searchId}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {userAdmin && <AssetGroupCreation onCreate={(result) => setAssetGroups([result, ...assetGroups])} />}
      <MuiDrawer
        open={selectedAssetGroupId !== undefined}
        keepMounted={false}
        anchor="right"
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={() => setSelectedAssetGroupId(undefined)}
        elevation={1}
      >
        {selectedAssetGroupId !== undefined && (
          <AssetGroupManagement
            assetGroupId={selectedAssetGroupId}
            handleClose={() => setSelectedAssetGroupId(undefined)}
            onUpdate={(result) => setAssetGroups(assetGroups.map((ag) => (ag.asset_group_id !== result.asset_group_id ? ag : result)))}
            onRemoveEndpointFromAssetGroup={(assetId) => setAssetGroups(assetGroups.map((ag) => (ag.asset_group_id !== selectedAssetGroupId ? ag : {
              ...ag,
              asset_group_assets: ag?.asset_group_assets?.toSpliced(ag?.asset_group_assets?.indexOf(assetId), 1),
            })))}
          />
        )}
      </MuiDrawer>
    </>
  );
};

export default AssetGroups;
