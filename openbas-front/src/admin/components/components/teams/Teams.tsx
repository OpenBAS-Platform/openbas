import { Drawer, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { CheckCircleOutlined, GroupsOutlined } from '@mui/icons-material';
import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useSearchParams } from 'react-router-dom';
import ItemTags from '../../../../components/ItemTags';
import TeamPopover from './TeamPopover';
import { useFormatter } from '../../../../components/i18n';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { SearchPaginationInput } from '../../../../utils/api-types';
import { searchTeams } from '../../../../actions/teams/team-actions';
import TeamPlayers from './TeamPlayers';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { initSorting } from '../../../../components/common/pagination/Page';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';

const useStyles = makeStyles(() => ({
  itemHeader: {
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
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
}));

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  team_name: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_description: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_users_number: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_tags: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_contextual: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_updated_at: {
    float: 'left',
    width: '12%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  team_name: {
    width: '20%',
  },
  team_description: {
    width: '25%',
  },
  team_users_number: {
    width: '10%',
  },
  team_tags: {
    width: '20%',
  },
  team_contextual: {
    width: '10%',
  },
  team_updated_at: {
    width: '12%',
  },
};

const Teams = () => {
  // Standard hooks
  const classes = useStyles();
  const { t, nsdt } = useFormatter();

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [searchId] = searchParams.getAll('id');

  // Headers
  const headers = [
    { field: 'team_name', label: 'Name', isSortable: true },
    { field: 'team_description', label: 'Description', isSortable: true },
    { field: 'team_users_number', label: 'Players', isSortable: true },
    { field: 'team_tags', label: 'Tags', isSortable: true },
    { field: 'team_contextual', label: 'Contextual', isSortable: true },
    { field: 'team_updated_at', label: 'Updated', isSortable: true },
  ];

  const [teams, setTeams] = useState<TeamStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('team_name'),
    textSearch: search,
  });

  // Export
  const exportProps = {
    exportType: 'team',
    exportKeys: [
      'team_name',
      'team_description',
      'team_users_number',
      'team_enabled',
      'team_tags',
    ],
    exportData: teams,
    exportFileName: `${t('Teams')}.csv`,
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Teams') }, { label: t('Teams of players'), current: true }]} />
      <PaginationComponent
        fetch={searchTeams}
        searchPaginationInput={searchPaginationInput}
        setContent={setTeams}
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
                inlineStylesHeaders={inlineStylesHeaders}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
              />
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {teams.map((team: TeamStore) => (
          <ListItem
            key={team.team_id}
            classes={{ root: classes.item }}
            divider
          >
            <ListItemIcon>
              <GroupsOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_name}
                  >
                    {team.team_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_description}
                  >
                    {team.team_description}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_users_number}
                  >
                    {team.team_users_number}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_tags}
                  >
                    <ItemTags variant="list" tags={team.team_tags} />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_contextual}
                  >
                    {team.team_contextual ? <CheckCircleOutlined fontSize="small" /> : '-'}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_updated_at}
                  >
                    {nsdt(team.team_updated_at)}
                  </div>
                </>
              }
            />
            <ListItemSecondaryAction>
              <TeamPopover
                team={team}
                managePlayers={() => setSelectedTeam(team.team_id)}
                openEditOnInit={team.team_id === searchId}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Drawer
        open={selectedTeam !== null}
        keepMounted={false}
        anchor="right"
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={() => setSelectedTeam(null)}
        elevation={1}
      >
        {selectedTeam !== null && (
          <TeamPlayers
            teamId={selectedTeam}
            handleClose={() => setSelectedTeam(null)}
          />
        )}
      </Drawer>
    </>
  );
};

export default Teams;
