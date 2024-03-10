import React, { CSSProperties } from 'react';
import { makeStyles } from '@mui/styles';
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { ComputerOutlined, FileDownloadOutlined } from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import { differenceInHours } from 'date-fns';
import EndpointCreation from './EndpointCreation';
import EndpointPopover from './EndpointPopover';
import SearchFilter from '../../../../components/SearchFilter';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { useFormatter } from '../../../../components/i18n';
import { exportData } from '../../../../utils/Environment';
import { useAppDispatch } from '../../../../utils/hooks';
import type { TagsHelper, UsersHelper } from '../../../../actions/helper';
import type { EndpointsHelper } from '../../../../actions/assets/asset-helper';
import { fetchEndpoints } from '../../../../actions/assets/endpoint-actions';
import TagsFilter from '../../../../components/TagsFilter';
import type { EndpointStore } from './Endpoint';
import ItemTags from '../../../../components/ItemTags';
import AssetStatus from '../AssetStatus';
import Breadcrumbs from '../../../../components/Breadcrumbs';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    display: 'flex',
    gap: '10px',
  },
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
  downloadButton: {
    marginRight: 15,
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
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Filter and sort hook
  const filtering = useSearchAnFilter('asset', 'name', ['name']);

  // Fetching data
  const { endpoints, userAdmin, tagsMap } = useHelper((helper: EndpointsHelper & UsersHelper & TagsHelper) => ({
    endpoints: helper.getEndpoints(),
    userAdmin: helper.getMe()?.user_admin ?? false,
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchEndpoints());
  });

  const sortedEndpoints: EndpointStore[] = filtering.filterAndSort(endpoints);

  const MAX_ALIVE_HOURS = 6;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Assets') }, { label: t('Endpoints'), current: true }]} />
      <div className={classes.parameters}>
        <div className={classes.filters}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
        <div className={classes.downloadButton}>
          {sortedEndpoints.length > 0 ? (
            <CSVLink
              data={exportData(
                'endpoint',
                [
                  'asset_name',
                  'asset_description',
                  'asset_last_seen',
                  'endpoint_ips',
                  'endpoint_hostname',
                  'endpoint_platform',
                  'endpoint_mac_addresses',
                  'asset_tags',
                ],
                sortedEndpoints,
                tagsMap,
              )}
              filename={'Endpoints.csv'}
            >
              <Tooltip title={t('Export this list')}>
                <IconButton>
                  <FileDownloadOutlined color="primary"/>
                </IconButton>
              </Tooltip>
            </CSVLink>
          ) : (
            <IconButton size="large" disabled>
              <FileDownloadOutlined/>
            </IconButton>
          )}
        </div>
      </div>
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
              <div>
                {filtering.buildHeader(
                  'asset_name',
                  'Name',
                  true,
                  inlineStylesHeaders,
                )}
                {filtering.buildHeader(
                  'endpoint_hostname',
                  'Hostname',
                  true,
                  inlineStylesHeaders,
                )}
                {filtering.buildHeader(
                  'endpoint_platform',
                  'Platform',
                  true,
                  inlineStylesHeaders,
                )}
                {filtering.buildHeader(
                  'endpoint_collected_by',
                  'Collected by',
                  false,
                  inlineStylesHeaders,
                )}
                {filtering.buildHeader(
                  'asset_tags',
                  'Tags',
                  true,
                  inlineStylesHeaders,
                )}
                {filtering.buildHeader(
                  'asset_status',
                  'Status',
                  false,
                  inlineStylesHeaders,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {sortedEndpoints.map((endpoint) => (
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
                    <ItemTags variant="list" tags={endpoint.asset_tags}/>
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.asset_status}
                  >
                    <AssetStatus variant="list" status={(endpoint.asset_last_seen && differenceInHours(new Date().toISOString(), endpoint.asset_last_seen) > MAX_ALIVE_HOURS) ? 'Active' : 'Inactive'}/>
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <EndpointPopover endpoint={endpoint}/>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {userAdmin && <EndpointCreation />}
    </>
  );
};

export default Endpoints;
