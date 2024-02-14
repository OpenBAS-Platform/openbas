import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Tooltip, IconButton, Drawer } from '@mui/material';
import { useDispatch } from 'react-redux';
import { FileDownloadOutlined, GroupsOutlined } from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import { fetchTeams } from '../../../actions/Team';
import { fetchOrganizations } from '../../../actions/Organization';
import ItemTags from '../../../components/ItemTags';
import TagsFilter from '../../../components/TagsFilter';
import SearchFilter from '../../../components/SearchFilter';
import { fetchTags } from '../../../actions/Tag';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useFormatter } from '../../../components/i18n';
import { exportData } from '../../../utils/Environment';
import TeamPlayers from './teams/TeamPlayers';
import CreateTeam from '../components/teams/CreateTeam';
import TeamPopover from '../components/teams/TeamPopover';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
  },
  container: {
    marginTop: 10,
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
    height: '100%',
    fontSize: 13,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
}));

const headerStyles = {
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
    width: '8%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_organization: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_tags: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  team_name: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_description: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_users_number: {
    float: 'left',
    width: '8%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_organization: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_tags: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Teams = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [selectedTeam, setSelectedTeam] = useState(null);
  // Filter and sort hook
  const searchColumns = [
    'name',
    'description',
    'organization',
  ];
  const filtering = useSearchAnFilter('team', 'name', searchColumns);
  // Fetching data
  const { isPlanner, teams, organizationsMap, tagsMap } = useHelper((helper) => ({
    isPlanner: helper.getMe().user_is_planner,
    teams: helper.getTeams(),
    organizationsMap: helper.getOrganizationsMap(),
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchOrganizations());
    dispatch(fetchTeams());
  });
  const sortedTeams = filtering.filterAndSort(teams);
  return (
    <>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
        <div style={{ float: 'right', margin: '-5px 15px 0 0' }}>
          {sortedTeams.length > 0 ? (
            <CSVLink
              data={exportData(
                'team',
                [
                  'team_name',
                  'team_description',
                  'team_organization',
                  'team_tags',
                  'team_users_number',
                ],
                sortedTeams,
                tagsMap,
                organizationsMap,
              )}
              filename={`${t('Teams')}.csv`}
            >
              <Tooltip title={t('Export this list')}>
                <IconButton size="large">
                  <FileDownloadOutlined color="primary" />
                </IconButton>
              </Tooltip>
            </CSVLink>
          ) : (
            <IconButton size="large" disabled={true}>
              <FileDownloadOutlined />
            </IconButton>
          )}
        </div>
      </div>
      <div className="clearfix" />
      <List classes={{ root: classes.container }}>
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
                  'team_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'team_description',
                  'Description',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader('team_users_number', 'Players', true, headerStyles)}
                {filtering.buildHeader(
                  'team_organization',
                  'Organization',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader('team_tags', 'Tags', true, headerStyles)}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {sortedTeams.map((team) => (
          <ListItem
            key={team.team_id}
            classes={{ root: classes.item }}
            divider={true}
            button={true}
            onClick={() => setSelectedTeam(team.team_id)}
          >
            <ListItemIcon>
              <GroupsOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
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
                    <strong>{team.team_users_number}</strong>
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_organization}
                  >
                    {organizationsMap[team.team_organization]
                      ?.organization_name || '-'}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_tags}
                  >
                    <ItemTags variant="list" tags={team.team_tags} />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <TeamPopover team={team} managePlayers={() => setSelectedTeam(team.team_id)} />
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
            tagsMap={tagsMap}
          />
        )}
      </Drawer>
      {isPlanner && <CreateTeam />}
    </>
  );
};

export default Teams;
