import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import SortHeadersList, { Header } from '../../../../components/common/SortHeadersList';
import { ComputerOutlined, LanOutlined } from '@mui/icons-material';
import ItemTags from '../../../../components/ItemTags';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { AssetGroupsHelper } from '../../../../actions/assetgroups/assetgroup-helper';
import { fetchAssetGroups } from '../../../../actions/assetgroups/assetgroup-action';
import { AssetGroupStore } from './AssetGroup';

const useStyles = makeStyles(() => ({
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
  asset_group_name: {
    float: 'left',
    width: '50%',
    fontSize: 12,
    fontWeight: '700',
  },
  asset_group_tags: {
    float: 'left',
    width: '50%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  asset_group_name: {
    width: '50%',
  },
  asset_group_tags: {
    width: '50%',
  },
};

interface Props {
  assetGroups: AssetGroupStore[];
  actions:
    | React.ReactElement
    | null;
}

const AssetGroupsList: FunctionComponent<Props> = ({
  assetGroups = [],
  actions,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const { assetGroupsMap } = useHelper((helper: AssetGroupsHelper) => ({
    assetGroupsMap: helper.getAssetGroupMaps(),
  }));
  useDataLoader(() => {
    dispatch(fetchAssetGroups());
  });

  // Headers
  const headers: Header[] = [
    { field: 'asset_group_name', label: 'Name', isSortable: true },
    { field: 'asset_group_tags', label: 'Tags', isSortable: true },
  ];

  const component = (assetGroup: AssetGroupStore) => {
    if (actions) {
      return React.cloneElement(actions as React.ReactElement, { assetGroup: assetGroup });
    }
  };

  const [sortedAssetGroups, setSortedAssetGroups] = useState(assetGroups);
  useEffect(() => {
    setSortedAssetGroups(assetGroups)
  }, [assetGroups]);

  return (
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
                initialSortBy={'asset_group_name'}
                datas={sortedAssetGroups}
                setDatas={setSortedAssetGroups}
              />
            </div>
          }
        />
        <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
      </ListItem>
      {sortedAssetGroups?.map((assetGroup) => {
        return (
          <ListItem
            key={assetGroup.asset_group_id}
            classes={{ root: classes.item }}
            divider={true}
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
                    style={inlineStyles.asset_group_tags}
                  >
                    <ItemTags variant="list" tags={assetGroup.asset_group_tags} />
                  </div>
                </>
              }
            />
            <ListItemSecondaryAction>
              {component(assetGroup)}
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

export default AssetGroupsList;
