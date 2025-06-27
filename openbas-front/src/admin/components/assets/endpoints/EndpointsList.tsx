import { DevicesOtherOutlined, HelpOutlineOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { type CSSProperties, type FunctionComponent, type ReactElement } from 'react';
import { makeStyles } from 'tss-react/mui';

import PaginatedListLoader from '../../../../components/PaginatedListLoader';
import { type EndpointOutput } from '../../../../utils/api-types';
import EndpointListItemFragments from '../../common/endpoints/EndpointListItemFragments';
import AssetPlatformFragment from '../../common/endpoints/fragments/output/AssetPlatformFragment';
import AssetTagsFragment from '../../common/endpoints/fragments/output/AssetTagsFragment';
import AssetTypeFragment from '../../common/endpoints/fragments/output/AssetTypeFragment';
import { type EndpointPopoverProps } from './EndpointPopover';

const useStyles = makeStyles()(() => ({
  item: { height: 50 },
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
  asset_name: { width: '35%' },
  asset_platform: {
    width: '15%',
    display: 'flex',
    alignItems: 'center',
  },
  asset_tags: { width: '35%' },
  asset_type: { width: '10%' },
};

interface Props {
  endpoints: EndpointOutput[];
  renderActions: ((endpoint: EndpointOutput) => ReactElement<EndpointPopoverProps>);
  loading?: boolean;
}

const EndpointsList: FunctionComponent<Props> = ({
  endpoints,
  renderActions,
  loading = false,
}) => {
  // Standard hooks
  const { classes } = useStyles();

  const component = (endpoint: EndpointOutput) => {
    return renderActions(endpoint);
  };

  const headers = [
    {
      field: 'asset_name',
      label: 'Name',
      isSortable: true,
      value: (endpoint: EndpointOutput) => endpoint.asset_name,
    },
    {
      field: EndpointListItemFragments.ASSET_PLATFORM,
      label: 'Platform',
      isSortable: true,
      value: (endpoint: EndpointOutput) => <AssetPlatformFragment endpoint={endpoint} />,
    },
    {
      field: EndpointListItemFragments.ASSET_TAGS,
      label: 'Tags',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <AssetTagsFragment endpoint={endpoint} />,
    },
    {
      field: EndpointListItemFragments.ASSET_TYPE,
      label: 'Type',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <AssetTypeFragment endpoint={endpoint} />,
    },
  ];

  if (loading) {
    return (
      <PaginatedListLoader Icon={HelpOutlineOutlined} headers={headers} headerStyles={inlineStyles} />
    );
  }
  if (endpoints == undefined || endpoints?.length == 0) {
    return null;
  }
  return (
    <List>
      { endpoints?.map((endpoint) => {
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
                  {headers.map(header => (
                    <div
                      key={header.field}
                      className={classes.bodyItem}
                      style={inlineStyles[header.field]}
                    >
                      {header.value(endpoint)}
                    </div>
                  ))}
                </>
              )}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default EndpointsList;
