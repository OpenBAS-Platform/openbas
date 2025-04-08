import { GroupsOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import * as R from 'ramda';
import { useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import { findTeams } from '../../../../../actions/teams/team-actions';
import ItemTags from '../../../../../components/ItemTags';
import { type TeamOutput } from '../../../../../utils/api-types';
import TeamPopover from '../../../components/teams/TeamPopover';
import { PermissionsContext, TeamContext } from '../../Context';

const useStyles = makeStyles()(theme => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  column: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 2fr',
  },
  bodyItem: { fontSize: theme.typography.h3.fontSize },
}));

const InjectTeamsList = () => {
  // Standard hooks
  const { classes } = useStyles();
  const { permissions } = useContext(PermissionsContext);
  const { computeTeamUsersEnabled } = useContext(TeamContext);
  const { getValues, setValue } = useFormContext();

  const [teams, setTeams] = useState<TeamOutput[]>([]);
  const teamIds = getValues('inject_teams') || [];

  const sortTeams = R.sortWith(
    [R.ascend(R.prop('team_name'))],
  );
  useEffect(() => {
    findTeams(teamIds).then(result => setTeams(sortTeams(result.data)));
  }, [teamIds]);

  const onRemoveTeamFromInject = (teamIdToRemove: string) => {
    const teamIds = getValues('inject_teams') || [];
    const newTeamIds = teamIds.filter((id: string) => id !== teamIdToRemove);
    const newTeams = teams.filter(team => team.team_id !== teamIdToRemove);
    setValue('inject_teams', newTeamIds);
    setTeams(newTeams);
  };
  return (
    <List>
      {teams.map(team => (
        <ListItem
          key={team.team_id}
          classes={{ root: classes.item }}
          divider
          secondaryAction={(
            <TeamPopover
              team={team}
              onRemoveTeamFromInject={(teamId) => {
                onRemoveTeamFromInject(teamId);
              }}
              disabled={permissions.readOnly}
            />
          )}
        >
          <ListItemIcon>
            <GroupsOutlined />
          </ListItemIcon>
          <ListItemText
            primary={(
              <div className={classes.column}>
                <div className={classes.bodyItem}>
                  {team.team_name}
                </div>
                <div className={classes.bodyItem}>
                  {team.team_users_number}
                </div>
                <div className={classes.bodyItem}>
                  {computeTeamUsersEnabled?.(team.team_id)}
                </div>
                <div className={classes.bodyItem}>
                  <ItemTags variant="reduced-view" tags={team.team_tags} />
                </div>
              </div>
            )}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default InjectTeamsList;
