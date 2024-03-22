import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { ComputerOutlined } from '@mui/icons-material';
import { differenceInHours } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import EndpointCreation from './EndpointCreation';
import EndpointPopover from './EndpointPopover';
import { useHelper } from '../../../../store';
import { useFormatter } from '../../../../components/i18n';
import type { TagsHelper, UsersHelper } from '../../../../actions/helper';
import type { EndpointsHelper } from '../../../../actions/assets/asset-helper';
import type { EndpointStore } from './Endpoint';
import ItemTags from '../../../../components/ItemTags';
import AssetStatus from '../AssetStatus';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';
import { initSorting } from '../../../../components/common/pagination/Page';
import type { SearchPaginationInput } from '../../../../utils/api-types';
import { searchEndpoints } from '../../../../actions/assets/endpoint-actions';

const useStyles = makeStyles(() => ({
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
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
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  endpoint_hostname: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  endpoint_platform: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  endpoint_collected_by: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  asset_tags: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  asset_status: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  asset_name: {
    width: '25%',
  },
  endpoint_hostname: {
    width: '20%',
  },
  endpoint_platform: {
    width: '15%',
  },
  endpoint_collected_by: {
    width: '20%',
  },
  asset_tags: {
    width: '10%',
  },
  asset_status: {
    width: '10%',
  },
};

const collectedBy = (endpoint: EndpointStore) => {
  return Object.keys(endpoint.asset_sources ?? {}).join(', ');
};

const Endpoints = () => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [searchId] = searchParams.getAll('id');

  // Fetching data
  const { userAdmin } = useHelper((helper: EndpointsHelper & UsersHelper & TagsHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  const MAX_ALIVE_HOURS = 6;

  // Headers
  const headers = [
    { field: 'asset_name', label: 'Name', isSortable: true },
    { field: 'endpoint_hostname', label: 'Hostname', isSortable: true },
    { field: 'endpoint_platform', label: 'Platform', isSortable: true },
    { field: 'endpoint_collected_by', label: 'Collected by', isSortable: false },
    { field: 'asset_tags', label: 'Tags', isSortable: true },
    { field: 'asset_status', label: 'Status', isSortable: false },
  ];

  const [endpoints, setEndpoints] = useState<EndpointStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('asset_name'),
    textSearch: search,
  });

  // Export
  const exportProps = {
    exportType: 'endpoint',
    exportKeys: [
      'asset_name',
      'asset_description',
      'asset_last_seen',
      'endpoint_ips',
      'endpoint_hostname',
      'endpoint_platform',
      'endpoint_mac_addresses',
      'asset_tags',
    ],
    exportData: endpoints,
    exportFileName: `${t('Endpoints')}.csv`,
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Assets') }, { label: t('Endpoints'), current: true }]} />
      <PaginationComponent
        fetch={searchEndpoints}
        searchPaginationInput={searchPaginationInput}
        setContent={setEndpoints}
        exportProps={exportProps}
      />
      <List>
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
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStylesHeaders}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
              />
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {endpoints.map((endpoint) => (
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
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_name}
                  >
                    {endpoint.asset_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.endpoint_hostname}
                  >
                    {endpoint.endpoint_hostname}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.endpoint_platform}
                  >
                    {endpoint.endpoint_platform}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.endpoint_collected_by}
                  >
                    {collectedBy(endpoint)}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_tags}
                  >
                    <ItemTags variant="list" tags={endpoint.asset_tags} />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_status}
                  >
                    <AssetStatus variant="list"
                      status={(endpoint.asset_last_seen && differenceInHours(new Date().toISOString(), endpoint.asset_last_seen) <= MAX_ALIVE_HOURS) ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <EndpointPopover
                endpoint={{ ...endpoint, type: 'static' }}
                onUpdate={(result) => setEndpoints(endpoints.map((e) => (e.asset_id !== result.asset_id ? e : result)))}
                onDelete={(result) => setEndpoints(endpoints.filter((e) => (e.asset_id !== result)))}
                openEditOnInit={endpoint.asset_id === searchId}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {userAdmin && <EndpointCreation onCreate={(result) => setEndpoints([result, ...endpoints])}/>}
    </>
  );
};

export default Endpoints;
