import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { ComputerOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import SortHeadersList, { Header } from '../../../../components/common/SortHeadersList';
import type { EndpointStore } from './Endpoint';
import ItemTags from '../../../../components/ItemTags';

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

const inlineStyles: Record<string, CSSProperties> = {
  asset_name: {
    width: '50%',
  },
  asset_tags: {
    width: '50%',
  },
};

interface Props {
  endpoints: EndpointStore[];
  actions: React.ReactElement;
}

const EndpointsList: FunctionComponent<Props> = ({
  endpoints = [],
  actions,
}) => {
  // Standard hooks
  const classes = useStyles();

  // Headers
  const headers: Header[] = [
    { field: 'asset_name', label: 'Name', isSortable: true },
    { field: 'asset_tags', label: 'Tags', isSortable: true },
  ];

  const component = (endpoint: EndpointStore) => {
    return React.cloneElement(actions as React.ReactElement, { endpoint });
  };

  const [sortedEndpoints, setSortedEndpoints] = useState(endpoints);
  useEffect(() => {
    setSortedEndpoints(endpoints);
  }, [endpoints]);

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
                initialSortBy={'asset_name'}
                datas={sortedEndpoints}
                setDatas={setSortedEndpoints}
              />
            </div>
          }
        />
        <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
      </ListItem>
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
