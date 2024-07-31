import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { PersonOutlined } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { searchPlayers } from '../../../actions/User';
import { fetchOrganizations } from '../../../actions/Organization';
import ItemTags from '../../../components/ItemTags';
import CreatePlayer from './players/CreatePlayer';
import PlayerPopover from './players/PlayerPopover';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { initSorting } from '../../../components/common/queryable/Page';
import type { OrganizationHelper, UserHelper } from '../../../actions/helper';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../components/common/pagination/SortHeadersComponent';
import type { UserStore } from './players/Player';
import type { SearchPaginationInput } from '../../../utils/api-types';
import { useAppDispatch } from '../../../utils/hooks';
import { fetchTags } from '../../../actions/Tag';
import { buildSearchPagination } from '../../../components/common/queryable/QueryableUtils';

const useStyles = makeStyles(() => ({
  itemHeader: {
    textTransform: 'uppercase',
    cursor: 'pointer',
    paddingLeft: 10,
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItems: {
    display: 'flex',
    alignItems: 'center',
  },
  bodyItem: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  user_email: {
    width: '25%',
  },
  user_firstname: {
    width: '15%',
  },
  user_lastname: {
    width: '15%',
  },
  user_organization: {
    width: '20%',
    cursor: 'default',
  },
  user_tags: {
    width: '25%',
  },
};

const Players = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [searchId] = searchParams.getAll('id');

  // Headers
  const headers = [
    { field: 'user_email', label: 'Email address', isSortable: true },
    { field: 'user_firstname', label: 'Firstname', isSortable: true },
    { field: 'user_lastname', label: 'Lastname', isSortable: true },
    { field: 'user_organization', label: 'Organization', isSortable: false },
    { field: 'user_tags', label: 'Tags', isSortable: true },
  ];

  const [players, setPlayers] = useState<UserStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>(buildSearchPagination({
    sorts: initSorting('user_email'),
    textSearch: search,
  }));

  // Fetching data
  const { isPlanner, organizationsMap } = useHelper((helper: UserHelper & OrganizationHelper) => ({
    isPlanner: helper.getMe().user_is_planner,
    organizationsMap: helper.getOrganizationsMap(),
  }));

  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchOrganizations());
  });

  // Export
  const exportProps = {
    exportType: 'user',
    exportKeys: [
      'user_email',
      'user_firstname',
      'user_lastname',
      'user_phone',
      'user_tags',
    ],
    exportData: players,
    exportFileName: `${t('Players')}.csv`,
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Teams') }, { label: t('Players'), current: true }]} />
      <PaginationComponent
        fetch={searchPlayers}
        searchPaginationInput={searchPaginationInput}
        setContent={setPlayers}
        exportProps={exportProps}
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHeader }}
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
              />
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {players.map((player: UserStore) => (
          <ListItem
            key={player.user_id}
            classes={{ root: classes.item }}
            divider
          >
            <ListItemIcon>
              <PersonOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div className={classes.bodyItems}>
                  <div className={classes.bodyItem} style={inlineStyles.user_email}>
                    {player.user_email}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_firstname}>
                    {player.user_firstname}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_lastname}>
                    {player.user_lastname}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_organization}>
                    {organizationsMap[player.user_organization]?.organization_name || '-'}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_tags}>
                    <ItemTags variant="list" tags={player.user_tags} />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <PlayerPopover
                user={player}
                openEditOnInit={player.user_id === searchId}
                onUpdate={(result) => setPlayers(players.map((p) => (p.user_id !== result.user_id ? p : result)))}
                onDelete={(result) => setPlayers(players.filter((p) => (p.user_id !== result)))}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {isPlanner
        && <CreatePlayer
          onCreate={(result) => setPlayers([result, ...players])}
           />
      }
    </>
  );
};

export default Players;
