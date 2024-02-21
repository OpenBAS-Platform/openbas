import { CSVLink } from 'react-csv';
import { Drawer, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { CheckCircleOutlined, FileDownloadOutlined, GroupsOutlined } from '@mui/icons-material';
import React, { CSSProperties, useContext, useState } from 'react';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import { exportData } from '../../../../utils/Environment';
import ItemTags from '../../../../components/ItemTags';
import TeamPopover from './TeamPopover';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { useHelper } from '../../../../store';
import { useFormatter } from '../../../../components/i18n';
import type { TagsHelper } from '../../../../actions/helper';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { Tag, Team } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import TeamPlayers from './TeamPlayers';
import { PermissionsContext, TeamContext } from '../Context';
import AddTeams from './AddTeams';

const useStyles = makeStyles(() => ({
  itemHead: {
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
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

const headerStyles: Record<string, CSSProperties> = {
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
    width: '12%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_users_enabled_number: {
    float: 'left',
    width: '12%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_enabled: {
    float: 'left',
    width: '15%',
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
};

const inlineStyles: Record<string, CSSProperties> = {
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
    width: '12%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_users_enabled_number: {
    float: 'left',
    width: '12%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_tags: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_contextual: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

interface Props {
  currentTeamIds?: Team['team_id'][];
}

interface TeamStoreExtended extends TeamStore {
  team_users_enabled_number: number
}

const Teams: React.FC<Props> = ({ currentTeamIds = [] }) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { t } = useFormatter();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const { teams, tagsMap }: { teams: TeamStore[], tagsMap: Record<string, Tag> } = useHelper((helper: TagsHelper & TeamsHelper) => ({
    teams: helper.getTeams(),
    tagsMap: helper.getTagsMap(),
  }));

  const { computeTeamUsersEnabled } = useContext(TeamContext);
  const { permissions } = useContext(PermissionsContext);

  useDataLoader(() => {
    dispatch(fetchTeams());
  });

  // Filter and sort hook
  const filtering = useSearchAnFilter('team', 'name', [
    'name',
    'description',
  ]);

  const sortedTeams = filtering.filterAndSort(teams.filter((team) => currentTeamIds.includes(team.team_id)).map((team) => {
    if (computeTeamUsersEnabled) {
      return ({
        team_users_enabled_number: computeTeamUsersEnabled(team.team_id),
        ...team,
      });
    }
    return team;
  }));

  return (
    <>
      <div>
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
        <div
          style={{ float: 'right', margin: '-5px 15px 0 0', maxHeight: '35px' }}
        >
          {sortedTeams.length > 0 ? (
            <CSVLink
              data={exportData(
                'team',
                [
                  'team_name',
                  'team_description',
                  'team_users_number',
                  ...(computeTeamUsersEnabled ? ['team_users_enabled_number'] : []),
                  'team_enabled',
                  'team_tags',
                ],
                sortedTeams,
                tagsMap,
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
      <List style={{ marginTop: 10 }}>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon>
            <span
              style={{ padding: '0 8px 0 10px', fontWeight: 700, fontSize: 12 }}
            >
              #
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
                {filtering.buildHeader(
                  'team_users_number',
                  'Players',
                  true,
                  headerStyles,
                )}
                {computeTeamUsersEnabled && filtering.buildHeader(
                  'team_users_enabled_number',
                  'Enabled players',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'team_tags',
                  'Tags',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'team_contextual',
                  'Contextual',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
        </ListItem>
        {sortedTeams.map((team: TeamStoreExtended) => (
          <ListItem
            key={team.team_id}
            classes={{ root: classes.item }}
            divider={true}
            button={true}
            onClick={() => setSelectedTeam(team.team_id)}
          >
            <ListItemIcon>
              <GroupsOutlined />
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
                    {team.team_users_number}
                  </div>
                  {computeTeamUsersEnabled
                    && <div
                      className={classes.bodyItem}
                      style={inlineStyles.team_users_enabled_number}
                       >
                      {team.team_users_enabled_number}
                    </div>
                  }
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
                    {team.team_contextual ? (
                      <CheckCircleOutlined fontSize="small" />
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <TeamPopover
                team={team}
                managePlayers={() => setSelectedTeam(team.team_id)}
                disabled={permissions.readOnly}
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
      {permissions.canWrite && <AddTeams currentTeamIds={currentTeamIds} />}
    </>
  );
};

export default Teams;
