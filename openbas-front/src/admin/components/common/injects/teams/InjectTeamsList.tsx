import { ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { GroupsOutlined } from '@mui/icons-material';
import React, { FunctionComponent, useContext } from 'react';
import { makeStyles } from '@mui/styles';
import ItemTags from '../../../../../components/ItemTags';
import TeamPopover from '../../../components/teams/TeamPopover';
import type { TeamStore } from '../../../../../actions/teams/Team';
import type { Theme } from '../../../../../components/Theme';
import { PermissionsContext } from '../../Context';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  column: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
  },
  bodyItem: {
    fontSize: theme.typography.h3.fontSize,
  },
}));

interface Props {
  teams: Array<TeamStore & { team_users_enabled_number: number }>;
  handleRemoveTeam: (teamId: string) => void;
}

const InjectTeamsList: FunctionComponent<Props> = ({
  teams,
  handleRemoveTeam,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { permissions } = useContext(PermissionsContext);

  return (
    <>
      {teams.map((team) => (
        <ListItem
          key={team.team_id}
          classes={{ root: classes.item }}
          divider
        >
          <ListItemIcon>
            <GroupsOutlined />
          </ListItemIcon>
          <ListItemText
            primary={
              <div className={classes.column}>
                <div className={classes.bodyItem}>
                  {team.team_name}
                </div>
                <div className={classes.bodyItem}>
                  {team.team_users_number}
                </div>
                <div className={classes.bodyItem}>
                  {team.team_users_enabled_number}
                </div>
                <div className={classes.bodyItem}>
                  <ItemTags variant="list-reduce-view" tags={team.team_tags} />
                </div>
              </div>
            }
          />
          <ListItemSecondaryAction>
            <TeamPopover
              team={team}
              onRemoveTeamFromInject={handleRemoveTeam}
              disabled={permissions.readOnly}
            />
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </>
  );
};

export default InjectTeamsList;
