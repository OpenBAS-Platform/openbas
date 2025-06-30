import { DevicesOtherOutlined, HelpOutlineOutlined } from '@mui/icons-material';
import {
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
} from '@mui/material';
import { type CSSProperties, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { searchEndpoints } from '../../../../actions/assets/endpoint-actions';
import { type UserHelper } from '../../../../actions/helper';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import ExportButton from '../../../../components/common/ExportButton';
import { initSorting } from '../../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import { useFormatter } from '../../../../components/i18n';
import PaginatedListLoader from '../../../../components/PaginatedListLoader';
import { ENDPOINT_BASE_URL } from '../../../../constants/BaseUrls';
import { useHelper } from '../../../../store';
import { type EndpointOutput, type SearchPaginationInput } from '../../../../utils/api-types';
import useAuth from '../../../../utils/hooks/useAuth';
import EndpointListItemFragments from '../../common/endpoints/EndpointListItemFragments';
import AssetPlatformFragment from '../../common/endpoints/fragments/output/AssetPlatformFragment';
import AssetTagsFragment from '../../common/endpoints/fragments/output/AssetTagsFragment';
import EndpointActiveFragment from '../../common/endpoints/fragments/output/EndpointActiveFragment';
import EndpointAgentsExecutorsFragment from '../../common/endpoints/fragments/output/EndpointAgentsExecutorsFragment';
import EndpointAgentsPrivilegeFragment from '../../common/endpoints/fragments/output/EndpointAgentsPrivilegeFragment';
import EndpointArchFragment from '../../common/endpoints/fragments/output/EndpointArchFragment';
import EndpointCreation from './EndpointCreation';
import EndpointPopover from './EndpointPopover';
import ImportUploaderEndpoints from './ImportUploaderEndpoints';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

const inlineStyles: Record<string, CSSProperties> = {
  asset_name: { width: '25%' },
  endpoint_active: { width: '10%' },
  endpoint_agents_privilege: { width: '12%' },
  endpoint_platform: {
    width: '10%',
    display: 'flex',
    alignItems: 'center',
  },
  endpoint_arch: { width: '10%' },
  endpoint_agents_executor: {
    width: '13%',
    display: 'flex',
    alignItems: 'center',
  },
  asset_tags: { width: '15%' },
};

const Endpoints = () => {
  // Standard hooks
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();
  const { t } = useFormatter();
  const { settings } = useAuth();

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');

  // Fetching data
  const { userAdmin } = useHelper((helper: UserHelper) => ({ userAdmin: helper.getMeAdmin() }));
  const availableFilterNames = [
    'endpoint_platform',
    'endpoint_arch',
    'asset_tags',
  ];

  const [endpoints, setEndpoints] = useState<EndpointOutput[]>([]);
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('asset', buildSearchPagination({
    sorts: initSorting('asset_name'),
    textSearch: search,
  }));

  // Export
  const exportProps = {
    exportType: 'ENDPOINTS',
    exportKeys: [],
    exportData: endpoints,
    exportFileName: `${t('Endpoints')}.csv`,
    searchPaginationInput: searchPaginationInput,
  };

  const [loading, setLoading] = useState<boolean>(true);

  const searchEndpointsToLoad = (input: SearchPaginationInput) => {
    setLoading(true);
    return searchEndpoints(input).finally(() => setLoading(false));
  };

  // Headers
  const headers = [
    {
      field: EndpointListItemFragments.ASSET_NAME,
      label: 'Name',
      isSortable: true,
      value: (endpoint: EndpointOutput) => endpoint.asset_name,
    },
    {
      field: EndpointListItemFragments.ENDPOINT_ACTIVE,
      label: 'Status',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <EndpointActiveFragment endpoint={endpoint} />,
    },
    {
      field: EndpointListItemFragments.ENDPOINT_AGENTS_PRIVILEGE,
      label: 'Agents Privileges',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <EndpointAgentsPrivilegeFragment endpoint={endpoint} />,
    },
    {
      field: EndpointListItemFragments.ENDPOINT_PLATFORM,
      label: 'Platform',
      isSortable: true,
      value: (endpoint: EndpointOutput) => <AssetPlatformFragment endpoint={endpoint} />,
    },
    {
      field: EndpointListItemFragments.ENDPOINT_ARCH,
      label: 'Architecture',
      isSortable: true,
      value: (endpoint: EndpointOutput) => <EndpointArchFragment endpoint={endpoint} />,
    },
    {
      field: 'endpoint_agents_executor',
      label: 'Executors',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <EndpointAgentsExecutorsFragment endpoint={endpoint} />,
    },
    {
      field: EndpointListItemFragments.ASSET_TAGS,
      label: 'Tags',
      isSortable: false,
      value: (endpoint: EndpointOutput) => <AssetTagsFragment endpoint={endpoint} />,
    },
  ];

  return (
    <>
      <Breadcrumbs
        variant="list"
        elements={[{ label: t('Assets') }, {
          label: t('Endpoints'),
          current: true,
        }]}
      />
      <Alert variant="outlined" severity="info" style={{ marginBottom: 30 }}>
        {t('To register new endpoints, you will need to install an agent. You can find detailed instructions on the ')}
        <a href={`${settings.platform_base_url}/admin/agents`} target="_blank" rel="noopener noreferrer">
          {t('agent installation page')}
        </a>
        &nbsp;
        {t('and in our')}
        &nbsp;
        <a href="https://docs.openbas.io" target="_blank" rel="noreferrer">
          {t('documentation')}
        </a>
        .
      </Alert>
      <PaginationComponentV2
        fetch={searchEndpointsToLoad}
        searchPaginationInput={searchPaginationInput}
        setContent={setEndpoints}
        entityPrefix="asset"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
        topBarButtons={(
          <ToggleButtonGroup value="fake" exclusive>
            <ExportButton totalElements={queryableHelpers.paginationHelpers.getTotalElements()} exportProps={exportProps} />
            <ImportUploaderEndpoints />
          </ToggleButtonGroup>
        )}
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          style={{ paddingTop: 0 }}
          secondaryAction={<>&nbsp;</>}
        >
          <ListItemIcon />
          <ListItemText
            primary={(
              <SortHeadersComponentV2
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                sortHelpers={queryableHelpers.sortHelpers}
              />
            )}
          />
        </ListItem>
        {
          loading
            ? <PaginatedListLoader Icon={HelpOutlineOutlined} headers={headers} headerStyles={inlineStyles} />
            : endpoints.map((endpoint: EndpointOutput) => {
                return (
                  <ListItem
                    key={endpoint.asset_id}
                    divider
                    secondaryAction={
                      (userAdmin
                        && (
                          <EndpointPopover
                            inline
                            endpoint={{ ...endpoint }}
                            agentless={endpoint.asset_agents?.length === 0}
                            onUpdate={result => setEndpoints(endpoints.map(e => (e.asset_id !== result.asset_id ? e : result as EndpointOutput)))}
                            onDelete={result => setEndpoints(endpoints.filter(e => (e.asset_id !== result)))}
                          />
                        ))
                    }
                    disablePadding
                  >
                    <ListItemButton
                      component={Link}
                      to={`${ENDPOINT_BASE_URL}/${endpoint.asset_id}`}
                      classes={{ root: classes.item }}
                    >
                      <ListItemIcon>
                        <DevicesOtherOutlined color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={(
                          <div style={bodyItemsStyles.bodyItems}>
                            {headers.map(header => (
                              <div
                                key={header.field}
                                style={{
                                  ...bodyItemsStyles.bodyItem,
                                  ...inlineStyles[header.field],
                                }}
                              >
                                {header.value(endpoint)}
                              </div>
                            ))}
                          </div>
                        )}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })
        }
      </List>
      {userAdmin && <EndpointCreation onCreate={result => setEndpoints([result as EndpointOutput, ...endpoints])} agentless={true} />}
    </>
  );
};

export default Endpoints;
