import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { SelectGroup } from 'mdi-material-ui';
import * as React from 'react';
import { CSSProperties, FunctionComponent, useEffect, useMemo, useState } from 'react';

import { findAssetGroups } from '../../../../actions/asset_groups/assetgroup-action';
import ListLoader from '../../../../components/common/loader/ListLoader';
import { Header } from '../../../../components/common/SortHeadersList';
import ItemTags from '../../../../components/ItemTags';
import type { AssetGroupOutput } from '../../../../utils/api-types';

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
  assetGroupIds: string[];
  actions: React.ReactElement;
}

const AssetGroupsList: FunctionComponent<Props> = ({
  assetGroupIds = [],
  actions,
}) => {
  // Standard hooks
  const classes = useStyles();

  const component = (assetGroup: AssetGroupOutput) => {
    return React.cloneElement(actions as React.ReactElement, { assetGroup });
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [assetGroupValues, setAssetGroupValues] = useState<AssetGroupOutput[]>([]);
  useEffect(() => {
    setLoading(true);
    findAssetGroups(assetGroupIds).then((result) => {
      setAssetGroupValues(result.data);
      setLoading(false);
    });
  }, [assetGroupIds]);

  // Headers
  const headers: Header[] = useMemo(() => [
    {
      field: 'asset_group_name',
      label: 'Asset Group Name',
      isSortable: false,
      value: (assetGroup: AssetGroupOutput) => assetGroup.asset_group_name,
    },
    {
      field: 'asset_group_tags',
      label: 'tags',
      isSortable: false,
      value: (assetGroup: AssetGroupOutput) => <ItemTags variant="reduced-view" tags={assetGroup.asset_group_tags} />,
    },
  ], []);

  return (
    <>
      {
        loading
          ? <ListLoader Icon={SelectGroup} headers={[]} headerStyles={inlineStyles} />
          : (
              <List>
                {assetGroupValues?.map((assetGroup) => {
                  return (
                    <ListItem
                      key={assetGroup.asset_group_id}
                      classes={{ root: classes.item }}
                      divider
                    >
                      <ListItemIcon>
                        <SelectGroup color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={(
                          <>
                            {headers.map(header => (
                              <div
                                key={header.field}
                                className={classes.bodyItem}
                                style={inlineStyles[header.field]}
                              >
                                {header.value?.(assetGroup)}
                              </div>
                            ))}
                          </>
                        )}
                      />
                      <ListItemSecondaryAction>
                        {component(assetGroup)}
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )
      }
    </>
  );
};

export default AssetGroupsList;
