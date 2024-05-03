import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { Chip, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { ComputerOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import type { EndpointStore } from './Endpoint';
import ItemTags from '../../../../components/ItemTags';

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
    width: '40%',
  },
  asset_tags: {
    width: '40%',
  },
  asset_type: {
    width: '20%',
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
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_type}
                  >
                    <Chip
                      variant="outlined"
                      className={classes.typeChip}
                      label={endpoint.type}
                    />
                  </div>
                </>
              }
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
