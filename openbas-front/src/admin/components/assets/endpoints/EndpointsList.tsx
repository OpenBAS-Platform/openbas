import { DevicesOtherOutlined } from '@mui/icons-material';
import { Chip, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import * as React from 'react';

import ItemTags from '../../../../components/ItemTags';
import PlatformIcon from '../../../../components/PlatformIcon';
import type { EndpointStore } from './Endpoint';

const useStyles = makeStyles(() => ({
  item: {
    height: 50,
  },
  bodyItem: {
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  typeChip: {
    height: 20,
    borderRadius: 4,
    textTransform: 'uppercase',
    width: 100,
    marginBottom: 5,
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  asset_name: {
    width: '35%',
  },
  asset_platform: {
    width: '15%',
    display: 'flex',
    alignItems: 'center',
  },
  asset_tags: {
    width: '35%',
  },
  asset_type: {
    width: '10%',
  },
};

export type EndpointStoreWithType = EndpointStore & { type: string };

interface Props {
  endpoints: EndpointStoreWithType[];
  actions: React.ReactElement;
}

const EndpointsList: FunctionComponent<Props> = ({
  endpoints = [],
  actions,
}) => {
  // Standard hooks
  const classes = useStyles();

  const component = (endpoint: EndpointStore) => {
    return React.cloneElement(actions as React.ReactElement, { endpoint });
  };

  const [sortedEndpoints, setSortedEndpoints] = useState(endpoints);
  useEffect(() => {
    setSortedEndpoints(endpoints);
  }, [endpoints]);

  return (
    <List>
      {sortedEndpoints?.map((endpoint) => {
        return (
          <ListItem
            key={endpoint.asset_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <DevicesOtherOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={(
                <>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_name}
                  >
                    {endpoint.asset_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_platform}
                  >
                    <PlatformIcon platform={endpoint.endpoint_platform} width={20} marginRight={10} />
                    {' '}
                    {endpoint.endpoint_platform}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_tags}
                  >
                    <ItemTags variant="reduced-view" tags={endpoint.asset_tags} />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_type}
                  >
                    <Chip
                      variant="outlined"
                      className={classes.typeChip}
                      label={endpoint.asset_type}
                    />
                  </div>
                </>
              )}
            />
            <ListItemSecondaryAction>
              {component(endpoint)}
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

export default EndpointsList;
