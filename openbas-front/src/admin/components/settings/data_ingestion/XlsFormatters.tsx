import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { TableViewOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';
import type { SearchPaginationInput } from '../../../../utils/api-types';
import { initSorting } from '../../../../components/common/pagination/Page';
import Empty from '../../../../components/Empty';
import { useHelper } from '../../../../store';
import type { UserHelper } from '../../../../actions/helper';
import DataIngestionMenu from '../DataIngestionMenu';
import XlsFormatterCreation from './xls_formatter/XlsFormatterCreation';

const useStyles = makeStyles(() => ({
  bodyItems: {
    display: 'flex',
    alignItems: 'center',
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
  itemHead: {
    paddingLeft: 10,
    marginBottom: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  mapper_name: {
    width: '30%',
    cursor: 'default',
  },
};

interface MapperDump {
  id: number;
  mapper_name: string;
  mapper_value: string;
}

const XlsFormatters = () => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const { userAdmin } = useHelper((helper: UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  const mappers: MapperDump[] = [
    { id: 1, mapper_name: 'mapper1', mapper_value: '1' },
    { id: 2, mapper_name: 'mapper2', mapper_value: '2' },
    { id: 3, mapper_name: 'mapper3', mapper_value: '3' },
  ];

  // Headers
  const headers = [
    {
      field: 'mapper_name',
      label: 'Name',
      isSortable: true,
      value: (mapper: MapperDump) => mapper.mapper_name,
    },
  ];

  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('mapper_name'),
  });

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Settings') }, { label: t('Data ingestion') }, { label: t('Xls formatters'), current: true }]} />
      <DataIngestionMenu />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon />
          <ListItemText
            primary={
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
                defaultSortAsc
              />
            }
          />
        </ListItem>
        {
          mappers.map((mapper) => {
            return (
              <ListItem
                key={mapper.id}
                classes={{ root: classes.item }}
                divider={true}
              >
                <ListItemIcon>
                  <TableViewOutlined color="primary" />
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
                          {header.value(mapper)}
                        </div>
                      ))}
                    </div>
                  }
                />
                <ListItemSecondaryAction>
                  {/* <EndpointPopover
                    endpoint={{ ...endpoint, type: 'static' }}
                    onUpdate={(result) => setEndpoints(endpoints.map((e) => (e.asset_id !== result.asset_id ? e : result)))}
                    onDelete={(result) => setEndpoints(endpoints.filter((e) => (e.asset_id !== result)))}
                    openEditOnInit={endpoint.asset_id === searchId}
                  /> */}
                </ListItemSecondaryAction>
              </ListItem>

            );
          })
        }
        {!mappers ? (<Empty message={t('No data available')} />) : null}
      </List>
      {userAdmin && <XlsFormatterCreation />}
    </>
  );
};

export default XlsFormatters;
