import { makeStyles } from '@mui/styles';
import React, { CSSProperties, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Drawer as MuiDrawer, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { FileDownloadOutlined, HubOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { useHelper } from '../../../../store';
import type { TagsHelper, UsersHelper } from '../../../../actions/helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AssetGroupsHelper } from '../../../../actions/assetgroups/assetgroup-helper';
import type { AssetGroupStore } from './AssetGroup';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import { exportData } from '../../../../utils/Environment';
import ItemTags from '../../../../components/ItemTags';
import AssetGroupPopover from './AssetGroupPopover';
import AssetGroupCreation from './AssetGroupCreation';
import { fetchAssetGroups } from '../../../../actions/assetgroups/assetgroup-action';
import AssetGroupManagement from './AssetGroupManagement';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    display: 'flex',
    gap: '10px',
  },
  itemHead: {
    paddingLeft: 10,
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

const headerStyles: {
  iconSort: CSSProperties;
  asset_group_name: CSSProperties;
  asset_group_description: CSSProperties;
  asset_group_tags: CSSProperties;
} = {
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
    width: '50%',
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

const inlineStyles: {
  asset_group_name: CSSProperties;
  asset_group_description: CSSProperties;
  asset_group_tags: CSSProperties;
} = {
  asset_group_name: {
    width: '25%',
  },
  asset_group_description: {
    width: '50%',
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
  // Filter and sort hook
  const searchColumns = [
    'name',
  ];
  const filtering = useSearchAnFilter('asset_group', 'name', searchColumns);
  // Fetching data
  const { assetGroups, userAdmin, tagsMap } = useHelper((helper: AssetGroupsHelper & UsersHelper & TagsHelper) => ({
    assetGroups: helper.getAssetGroups(),
    userAdmin: helper.getMe()?.user_admin ?? false,
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchAssetGroups());
  });
  const sortedAssetGroups: [AssetGroupStore] = filtering.filterAndSort(assetGroups);
  const [selected, setSelected] = useState<AssetGroupStore | undefined>(undefined);
  return (
    <>
      <div className={classes.parameters}>
        <div className={classes.filters}>
          <SearchFilter
            small
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
        <div style={{ marginRight: '15px'}}>
          {sortedAssetGroups.length > 0 ? (
            <CSVLink
              data={exportData(
                'asset_group',
                [
                  'asset_group_name',
                  'asset_group_description',
                  'asset_group_tags',
                ],
                sortedAssetGroups,
                tagsMap,
              )}
              filename={`${t('AssetGroups')}.csv`}
            >
              <Tooltip title={t('Export this list')}>
                <IconButton size="large">
                  <FileDownloadOutlined color="primary" />
                </IconButton>
              </Tooltip>
            </CSVLink>
          ) : (
            <IconButton size="large" disabled>
              <FileDownloadOutlined />
            </IconButton>
          )}
        </div>
      </div>
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
              <div>
                {filtering.buildHeader(
                  'asset_group_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'asset_group_description',
                  'Description',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'asset_group_tags',
                  'Tags',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {sortedAssetGroups.map((assetGroup) => (
          <ListItem
            key={assetGroup.asset_group_id}
            classes={{ root: classes.item }}
            divider={true}
            button={true}
            onClick={() => setSelected(assetGroup)}
          >
            <ListItemIcon>
              <HubOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
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
                    style={inlineStyles.asset_group_tags}
                  >
                    <ItemTags variant="list" tags={assetGroup.asset_group_tags} />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <AssetGroupPopover assetGroup={assetGroup} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {userAdmin && <AssetGroupCreation />}
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
            assetGroup={selected}
            handleClose={() => setSelected(undefined)}
          />
        )}
      </MuiDrawer>
    </>
  );
};

export default AssetGroups;
