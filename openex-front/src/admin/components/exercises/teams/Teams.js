import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, Drawer, ListItemIcon, ListItemText, ListItemSecondaryAction, Tooltip, IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';
import { GroupsOutlined, FileDownloadOutlined, CheckCircleOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { useFormatter } from '../../../../components/i18n';
import useDataLoader from '../../../../utils/ServerSideEvent';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import { fetchExerciseTeams } from '../../../../actions/Exercise';
import TeamPopover from '../../components/teams/TeamPopover';
import TeamPlayers from '../../teams/teams/TeamPlayers';
import { useHelper } from '../../../../store';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { usePermissions } from '../../../../utils/Exercise';
import { exportData } from '../../../../utils/Environment';
import DefinitionMenu from '../DefinitionMenu';
import ExerciseAddTeams from './ExerciseAddTeams';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
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

const Teams = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [selectedTeam, setSelectedTeam] = useState(null);
  // Filter and sort hook
  const filtering = useSearchAnFilter('team', 'name', [
    'name',
    'description',
  ]);
  // Fetching data
  const { exerciseId } = useParams();
  const permissions = usePermissions(exerciseId);
  const { exercise, teams, tagsMap } = useHelper((helper) => ({
    exercise: helper.getExercise(exerciseId),
    teams: helper.getExerciseTeams(exerciseId),
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });
  const sortedTeams = filtering.filterAndSort(teams.map((n) => ({
    team_users_enabled_number: exercise.exercise_teams_users.filter((o) => o.exercise_id === exerciseId && o.team_id === n.team_id).length,
    ...n,
  })));
  return (
    <div className={classes.container}>
      <DefinitionMenu exerciseId={exerciseId} />
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
                  'team_users_enabled_number',
                  'team_enabled',
                  'team_tags',
                ],
                sortedTeams,
                tagsMap,
              )}
              filename={`[${exercise.exercise_name}] ${t('Teams')}.csv`}
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
                {filtering.buildHeader(
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
        {sortedTeams.map((team) => (
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
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.team_users_enabled_number}
                  >
                    {team.team_users_enabled_number}
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
                exerciseId={exerciseId}
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
            exerciseId={exerciseId}
            handleClose={() => setSelectedTeam(null)}
            tagsMap={tagsMap}
          />
        )}
      </Drawer>
      {permissions.canWrite && <ExerciseAddTeams exerciseId={exerciseId} exerciseTeamsIds={teams.map((team) => team.team_id)} />}
    </div>
  );
};

export default Teams;
