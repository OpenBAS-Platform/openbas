import { DevicesOtherOutlined } from '@mui/icons-material';
import { Chip, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { CSSProperties, FunctionComponent, useEffect, useState } from 'react';

import { findEndpoints } from '../../../../actions/assets/endpoint-actions';
import ListLoader from '../../../../components/common/loader/ListLoader';
import ItemTags from '../../../../components/ItemTags';
import PlatformIcon from '../../../../components/PlatformIcon';
import { EndpointOutput, EndpointOverviewOutput } from '../../../../utils/api-types';

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

export type EndpointStoreWithType = EndpointOutput & EndpointOverviewOutput & { type: string };

interface Props {
  endpointIds: string[];
  actions: React.ReactElement;
}

const EndpointsList: FunctionComponent<Props> = ({
  endpointIds = [],
  actions,
}) => {
  // Standard hooks
  const classes = useStyles();

  const component = (endpoint: EndpointOutput) => {
    return React.cloneElement(actions as React.ReactElement, { endpoint });
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [endpointValues, setEndpointValues] = useState<EndpointOutput[]>([]);
  useEffect(() => {
    setLoading(true);
    findEndpoints(endpointIds).then((result) => {
      setEndpointValues(result.data);
      setLoading(false);
    });
  }, [endpointIds]);

  const isLoading = loading && endpointIds.length > 0;

  return (
    <>
      {
        isLoading
          ? <ListLoader Icon={DevicesOtherOutlined} headers={[]} headerStyles={inlineStyles} />
          : (
              <List>
                {endpointValues?.map((endpoint) => {
                  return (
                    <ListItem
                      key={endpoint.asset_id}
                      classes={{ root: classes.item }}
                      divider={true}
                      secondaryAction={component(endpoint)}
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
                              <Tooltip title={endpoint.asset_type}>
                                <Chip
                                  variant="outlined"
                                  className={classes.typeChip}
                                  label={endpoint.asset_type}
                                />
                              </Tooltip>
                            </div>
                          </>
                        )}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )
      }
    </>
  );
};

export default EndpointsList;
