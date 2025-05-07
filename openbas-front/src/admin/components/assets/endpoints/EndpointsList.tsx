import { DevicesOtherOutlined, HelpOutlineOutlined } from '@mui/icons-material';
import { Chip, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { cloneElement, type CSSProperties, type FunctionComponent, type ReactElement } from 'react';
import { makeStyles } from 'tss-react/mui';

import ItemTags from '../../../../components/ItemTags';
import PaginatedListLoader from '../../../../components/PaginatedListLoader';
import PlatformIcon from '../../../../components/PlatformIcon';
import { type EndpointOutput } from '../../../../utils/api-types';
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
  const theme = useTheme();

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
      field: 'asset_platform',
      label: 'Platform',
      isSortable: true,
      value: (endpoint: EndpointOutput) => (
        <>
          <PlatformIcon platform={endpoint.endpoint_platform} width={20} marginRight={theme.spacing(2)} />
          {endpoint.endpoint_platform}
        </>
      ),
    },
    {
      field: 'asset_tags',
      label: 'Tags',
      isSortable: false,
      value: (endpoint: EndpointOutput) => (
        <ItemTags variant="reduced-view" tags={endpoint.asset_tags} />
      ),
    },
    {
      field: 'asset_type',
      label: 'Type',
      isSortable: false,
      value: (endpoint: EndpointOutput) => (
        <Tooltip title={endpoint.asset_type}>
          <Chip
            variant="outlined"
            className={classes.typeChip}
            label={endpoint.asset_type}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <List>
      {
        loading
          ? <PaginatedListLoader Icon={HelpOutlineOutlined} headers={headers} headerStyles={inlineStyles} />
          : endpoints?.map((endpoint) => {
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
          })
      }
    </List>
  );
};

export default EndpointsList;
