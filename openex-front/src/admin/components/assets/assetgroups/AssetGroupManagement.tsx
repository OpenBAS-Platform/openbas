import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Typography } from '@mui/material';
import { CloseRounded, ComputerOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import React, { CSSProperties, FunctionComponent, useState } from 'react';
import { makeStyles } from '@mui/styles';
import type { Theme } from '../../../../components/Theme';
import TagsFilter from '../../../../components/TagsFilter';
import SearchFilter from '../../../../components/SearchFilter';
import type { AssetGroupStore } from './AssetGroup';
import { Option } from '../../../../utils/Option';
import ItemTags from '../../../../components/ItemTags';
import SortHeadersList, { Header } from '../../../../components/common/SortHeadersList';
import AssetGroupAddAssets from './AssetGroupAddAssets';
import { useHelper } from '../../../../store';
import type { UsersHelper } from '../../../../actions/helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchEndpoints } from '../../../../actions/assets/endpoint-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import type { EndpointsHelper } from '../../../../actions/assets/asset-helper';
import type { EndpointStore } from '../endpoints/Endpoint';
import EndpointPopover from '../endpoints/EndpointPopover';
import { fetchAssetGroup } from '../../../../actions/assetgroups/assetgroup-action';

const useStyles = makeStyles((theme: Theme) => ({
  // Drawer Header
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  title: {
    float: 'left',
  },
  parameters: {
    float: 'right',
    marginTop: -8,
  },
  tags: {
    float: 'right',
  },
  search: {
    float: 'right',
    width: 200,
    marginRight: 20,
  },

  container: {
    marginTop: 10,
  },
  itemHead: {
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    height: 50,
  },
  bodyItem: {
    fontSize: 13,
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  asset_name: {
    float: 'left',
    width: '50%',
    fontSize: 12,
    fontWeight: '700',
  },
  asset_tags: {
    float: 'left',
    width: '50%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  asset_name: {
    width: '50%',
  },
  asset_tags: {
    width: '50%',
  },
};

interface Props {
  assetGroup: AssetGroupStore;
  handleClose: () => void;
}

const AssetGroupManagement: FunctionComponent<Props> = ({
  assetGroup,
  handleClose,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const { endpointsMap, userAdmin } = useHelper((helper: EndpointsHelper & UsersHelper) => ({
    endpointsMap: helper.getEndpointsMap(),
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  useDataLoader(() => {
    dispatch(fetchAssetGroup(assetGroup.asset_group_id));
    dispatch(fetchEndpoints());
  });

  // Filter
  const [keyword, setKeyword] = useState('');
  const handleSearch = (value: string) => {
    setKeyword(value);
  };

  const [tags, setTags] = useState<Option[]>([]);
  const handleAddTag = (value: Option) => {
    if (value) {
      setTags(R.uniq(R.append(value, tags)));
    }
  };
  const handleRemoveTag = (value: string) => {
    setTags(tags.filter((n) => n.id !== value));
  };

  // Headers

  const headers: Header[] = [
    { field: 'asset_name', label: 'Name', isSortable: true },
    { field: 'asset_tags', label: 'Tags', isSortable: true },
  ];

  return (
    <>
      <div className={classes.header}>
        <IconButton
          aria-label="Close"
          className={classes.closeButton}
          onClick={handleClose}
          size="large"
          color="primary"
        >
          <CloseRounded fontSize="small" color="primary" />
        </IconButton>
        <Typography variant="h6" classes={{ root: classes.title }}>
          {assetGroup.asset_group_name}
        </Typography>
        <div className={classes.parameters}>
          <div className={classes.tags}>
            <TagsFilter
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              currentTags={tags}
              thin
            />
          </div>
          <div className={classes.search}>
            <SearchFilter
              fullWidth
              onChange={handleSearch}
              keyword={keyword}
            />
          </div>
        </div>
        <div className="clearfix" />
      </div>
      <List classes={{ root: classes.container }}>
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
                <SortHeadersList
                  headers={headers}
                  inlineStylesHeaders={inlineStylesHeaders}
                  initialSortBy={'asset_name'}
                />
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {assetGroup.asset_group_assets?.map((assetId) => {
          const endpoint: EndpointStore = endpointsMap[assetId];
          return (
            <ListItem
              key={endpoint.asset_id}
              classes={{ root: classes.item }}
              divider={true}
            >
              <ListItemIcon>
                <ComputerOutlined color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.asset_name}
                    >
                      {endpoint.asset_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.asset_tags}
                    >
                      <ItemTags variant="list" tags={endpoint.asset_tags} />
                    </div>
                  </>
                }
              />
              <ListItemSecondaryAction>
                {userAdmin
                  ? (<EndpointPopover
                      endpoint={endpoint}
                      assetGroupId={assetGroup.asset_group_id}
                      assetGroupAssetIds={assetGroup.asset_group_assets ?? []}
                     />)
                  : <span> &nbsp; </span>
                }
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      {userAdmin
        && (<AssetGroupAddAssets
          assetGroupId={assetGroup.asset_group_id}
          assetGroupAssetIds={assetGroup.asset_group_assets ?? []}
            />)
      }
    </>
  );
};

export default AssetGroupManagement;
