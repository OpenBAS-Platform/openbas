import { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import * as React from 'react';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { SelectGroup } from 'mdi-material-ui';
import { makeStyles } from '@mui/styles';
import ItemTags from '../../../../components/ItemTags';
import type { AssetGroupStore } from './AssetGroup';

const useStyles = makeStyles(() => ({
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
  actions: React.ReactElement;
}

const AssetGroupsList: FunctionComponent<Props> = ({
  assetGroups = [],
  actions,
}) => {
  // Standard hooks
  const classes = useStyles();

  const component = (assetGroup: AssetGroupStore) => {
    return React.cloneElement(actions as React.ReactElement, { assetGroup });
  };

  const [sortedAssetGroups, setSortedAssetGroups] = useState(assetGroups);
  useEffect(() => {
    setSortedAssetGroups(assetGroups);
  }, [assetGroups]);

  return (
    <List>
      {sortedAssetGroups?.map((assetGroup) => {
        return (
          <ListItem
            key={assetGroup.asset_group_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <SelectGroup color="primary" />
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
                    <ItemTags variant="reduced-view" tags={assetGroup.asset_group_tags} />
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
