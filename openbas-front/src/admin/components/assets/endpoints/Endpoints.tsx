import React, { CSSProperties, useMemo, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { DevicesOtherOutlined } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../utils/hooks';
import EndpointCreation from './EndpointCreation';
import EndpointPopover from './EndpointPopover';
import { useHelper } from '../../../../store';
import { useFormatter } from '../../../../components/i18n';
import type { UserHelper } from '../../../../actions/helper';
import type { EndpointStore } from './Endpoint';
import ItemTags from '../../../../components/ItemTags';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { initSorting } from '../../../../components/common/queryable/Page';
import type { EndpointOutput } from '../../../../utils/api-types';
import { searchEndpoints } from '../../../../actions/assets/endpoint-actions';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchTags } from '../../../../actions/Tag';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import ExportButton from '../../../../components/common/ExportButton';
import SortHeadersComponentV2 from '../../../../components/common/queryable/sort/SortHeadersComponentV2';
import { Header } from '../../../../components/common/SortHeadersList';
import { fetchExecutors } from '../../../../actions/Executor';
import ItemExecutor from '../../../../components/ItemExecutor';
import AssetStatus from '../AssetStatus';
import PlatformIcon from '../../../../components/PlatformIcon';

const useStyles = makeStyles(() => ({
  itemHead: {
    textTransform: 'uppercase',
  },
  item: {
    height: 50,
  },
  bodyItems: {
    display: 'flex',
  },
  bodyItem: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxSizing: 'content-box',
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  asset_name: {
    width: '30%',
  },
  endpoint_platform: {
    width: '15%',
    display: 'flex',
    alignItems: 'center',
  },
  endpoint_arch: {
    width: '10%',
    display: 'flex',
    alignItems: 'center',
  },
  asset_executor: {
    width: '15%',
    display: 'flex',
    alignItems: 'center',
  },
  asset_tags: {
    width: '20%',
  },
  asset_active: {
    width: '15%',
    cursor: 'default',
  },
};

const Endpoints = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [searchId] = searchParams.getAll('id');

  // Fetching data
  const { userAdmin } = useHelper((helper: UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  useDataLoader(() => {
    dispatch(fetchExecutors());
    dispatch(fetchTags());
  });

  // Headers
  const headers: Header[] = useMemo(() => [
    {
      field: 'asset_name',
      label: t('Name'),
      isSortable: true,
      value: (endpoint: EndpointOutput) => endpoint.asset_name,
    },
    {
      field: 'endpoint_platform',
      label: 'Platform',
      isSortable: true,
      value: (endpoint: EndpointOutput) => (
        <>
          <PlatformIcon platform={endpoint.endpoint_platform} width={20} marginRight={10}/> {endpoint.endpoint_platform}
        </>
      ),
    },
    {
      field: 'endpoint_arch',
      label: t('Architecture'),
      isSortable: true,
      value: (endpoint: EndpointOutput) => endpoint.endpoint_arch,
    },
    {
      field: 'asset_executor',
      label: t('Executor'),
      isSortable: true,
      value: (endpoint: EndpointOutput) => <ItemExecutor executorId={endpoint.asset_executor ?? null}/>,
    },
    {
      field: 'asset_tags',
      label: t('Tags'),
      isSortable: false,
      value: (endpoint: EndpointOutput) => <ItemTags variant="list" tags={endpoint.asset_tags} />,
    },
    {
      field: 'asset_active',
      label: t('Status'),
      isSortable: false,
      value: (endpoint: EndpointOutput) => <AssetStatus variant="list" status={endpoint.asset_active ? 'Active' : 'Inactive'}/>,
    },
  ], []);

  const availableFilterNames = [
    'asset_name',
    'endpoint_platform',
    'endpoint_arch',
    'asset_executor',
    'asset_tags',
    'asset_last_seen',
  ];

  const [endpoints, setEndpoints] = useState<EndpointStore[]>([]);
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('endpoints', buildSearchPagination({
    sorts: initSorting('asset_name'),
    textSearch: search,
  }));

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
      <PaginationComponentV2
        fetch={searchEndpoints}
        searchPaginationInput={searchPaginationInput}
        setContent={setEndpoints}
        entityPrefix="endpoint"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
        topBarButtons={
          <ExportButton totalElements={queryableHelpers.paginationHelpers.getTotalElements()} exportProps={exportProps} />
        }
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
          secondaryAction={<>&nbsp;</>}
        >
          <ListItemIcon />
          <ListItemText
            primary={
              <SortHeadersComponentV2
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                sortHelpers={queryableHelpers.sortHelpers}
              />
            }
          />
          <ListItemSecondaryAction />
        </ListItem>
        {endpoints.map((endpoint: EndpointOutput) => {
          return (
            <ListItem
              key={endpoint.asset_id}
              classes={{ root: classes.item }}
              divider
            >
              <ListItemIcon>
                <DevicesOtherOutlined color="primary"/>
              </ListItemIcon>
              <ListItemText
                primary={
                  <div className={classes.bodyItems}>
                    {headers.map((header) => (
                      <div
                        key={header.field}
                        className={classes.bodyItem}
                        style={inlineStyles[header.field]}
                      >
                        {header.value?.(endpoint)}
                      </div>
                    ))}
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
          );
        })}
      </List>
      {userAdmin && <EndpointCreation onCreate={(result) => setEndpoints([result, ...endpoints])} />}
    </>
  );
};

export default Endpoints;
