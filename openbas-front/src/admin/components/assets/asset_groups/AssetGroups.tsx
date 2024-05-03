import { makeStyles } from '@mui/styles';
import React, { CSSProperties, useState } from 'react';
import { Drawer as MuiDrawer, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { LanOutlined } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import type { TagsHelper, UsersHelper } from '../../../../actions/helper';
import type { AssetGroupStore } from './AssetGroup';
import ItemTags from '../../../../components/ItemTags';
import AssetGroupPopover from './AssetGroupPopover';
import AssetGroupCreation from './AssetGroupCreation';
import { searchAssetGroups } from '../../../../actions/asset_groups/assetgroup-action';
import AssetGroupManagement from './AssetGroupManagement';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import type { EndpointsHelper } from '../../../../actions/assets/asset-helper';
import type { SearchPaginationInput } from '../../../../utils/api-types';
import { initSorting } from '../../../../components/common/pagination/Page';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';

const useStyles = makeStyles(() => ({
  itemHeader: {
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
}));

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  asset_group_name: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  asset_group_description: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  asset_group_assets: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  asset_group_dynamic_assets: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  asset_group_tags: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  asset_group_name: {
    width: '25%',
  },
  asset_group_description: {
    width: '20%',
  },
  asset_group_assets: {
    width: '15%',
  },
  asset_group_dynamic_assets: {
    width: '15%',
  },
  asset_group_tags: {
    width: '25%',
  },
};

const AssetGroups = () => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const [selected, setSelected] = useState<AssetGroupStore | undefined>(undefined);

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [searchId] = searchParams.getAll('id');

  // Fetching data
  const { userAdmin } = useHelper((helper: EndpointsHelper & UsersHelper & TagsHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  // Headers
  const headers = [
    { field: 'asset_group_name', label: 'Name', isSortable: true },
    { field: 'asset_group_description', label: 'Description', isSortable: true },
    { field: 'asset_group_assets', label: 'Assets', isSortable: false },
    { field: 'asset_group_dynamic_assets', label: 'Dynamic assets', isSortable: false },
    { field: 'asset_group_tags', label: 'Tags', isSortable: true },
  ];

  const [assetGroups, setAssetGroups] = useState<AssetGroupStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('asset_group_name'),
    textSearch: search,
  });

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
          classes={{ root: classes.itemHeader }}
          divider={false}
          style={{ paddingTop: 0 }}
        >

          <ListItemIcon />
          <ListItemText
            primary={
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStylesHeaders}
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
            onClick={() => setSelected(assetGroup)}
          >
            <ListItemIcon>
              <LanOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_group_name}
                  >
                    {assetGroup.asset_group_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_group_description}
                  >
                    {assetGroup.asset_group_description}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_group_assets}
                  >
                    {assetGroup.asset_group_assets?.length ?? 0}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_group_dynamic_assets}
                  >
                    {assetGroup.asset_group_dynamic_assets?.length ?? 0}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_group_tags}
                  >
                    <ItemTags variant="list" tags={assetGroup.asset_group_tags} />
                  </div>
                </>
              }
            />
            <ListItemSecondaryAction>
              <AssetGroupPopover
                assetGroup={assetGroup}
                onUpdate={(result) => setAssetGroups(assetGroups.map((ag) => (ag.asset_group_id !== result.asset_group_id ? ag : result)))}
                onDelete={(result) => setAssetGroups(assetGroups.filter((ag) => (ag.asset_group_id !== result)))}
                openEditOnInit={assetGroup.asset_group_id === searchId}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {userAdmin && <AssetGroupCreation onCreate={(result) => setAssetGroups([result, ...assetGroups])} />}
      <MuiDrawer
        open={selected !== undefined}
        keepMounted={false}
        anchor="right"
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={() => setSelected(undefined)}
        elevation={1}
      >
        {selected !== undefined && (
          <AssetGroupManagement
            assetGroupId={selected.asset_group_id}
            handleClose={() => setSelected(undefined)}
            onUpdate={(result) => setAssetGroups(assetGroups.map((ag) => (ag.asset_group_id !== result.asset_group_id ? ag : result)))}
          />
        )}
      </MuiDrawer>
    </>
  );
};

export default AssetGroups;
