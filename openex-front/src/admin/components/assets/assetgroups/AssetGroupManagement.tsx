import { IconButton, Typography } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import type { Theme } from '../../../../components/Theme';
import TagsFilter from '../../../../components/TagsFilter';
import SearchFilter from '../../../../components/SearchFilter';
import AssetGroupAddEndpoints from './AssetGroupAddEndpoints';
import { useHelper } from '../../../../store';
import type { UsersHelper } from '../../../../actions/helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchEndpoints } from '../../../../actions/assets/endpoint-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchAssetGroup } from '../../../../actions/assetgroups/assetgroup-action';
import type { AssetGroupsHelper } from '../../../../actions/assetgroups/assetgroup-helper';
import EndpointsList from '../endpoints/EndpointsList';
import EndpointPopover from '../endpoints/EndpointPopover';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import type { EndpointStore } from '../endpoints/Endpoint';
import type { EndpointsHelper } from '../../../../actions/assets/asset-helper';

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
}));

interface Props {
  assetGroupId: string;
  handleClose: () => void;
}

const AssetGroupManagement: FunctionComponent<Props> = ({
  assetGroupId,
  handleClose,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Filter and sort hook
  const filtering = useSearchAnFilter('asset', 'name', ['name']);

  // Fetching data
  const { assetGroup, endpointsMap, userAdmin } = useHelper((helper: AssetGroupsHelper & EndpointsHelper & UsersHelper) => ({
    assetGroup: helper.getAssetGroup(assetGroupId),
    endpointsMap: helper.getEndpointsMap(),
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  useDataLoader(() => {
    dispatch(fetchAssetGroup(assetGroupId));
    dispatch(fetchEndpoints());
  });

  const endpoints = assetGroup.asset_group_assets.filter((endpointId: string) => !!endpointsMap[endpointId]).map((endpointId: string) => endpointsMap[endpointId]);
  const sortedAsset: EndpointStore[] = filtering.filterAndSort(endpoints);

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
              onAddTag={filtering.handleAddTag}
              onRemoveTag={filtering.handleRemoveTag}
              currentTags={filtering.tags}
              thin
            />
          </div>
          <div className={classes.search}>
            <SearchFilter
              fullWidth
              onChange={filtering.handleSearch}
              keyword={filtering.keyword}
            />
          </div>
        </div>
        <div className="clearfix" />
      </div>
      <EndpointsList
        endpoints={sortedAsset}
        actions=
          {userAdmin
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Endpoint property handle by EndpointsList
            ? (<EndpointPopover
                inline
                assetGroupId={assetGroup.asset_group_id}
                assetGroupEndpointIds={assetGroup.asset_group_assets ?? []}
               />)
            : <span> &nbsp; </span>
          }
      />
      {userAdmin
        && (<AssetGroupAddEndpoints
          assetGroupId={assetGroup.asset_group_id}
          assetGroupEndpointIds={assetGroup.asset_group_assets ?? []}
            />)
      }
    </>
  );
};

export default AssetGroupManagement;
