import React, { useState } from 'react';
import * as R from 'ramda';
import { Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add, GroupsOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { truncate } from '../../../../utils/String';
import ItemTags from '../../../../components/ItemTags';
import TagsFilter from '../../common/filters/TagsFilter';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import type { OrganizationHelper } from '../../../../actions/helper';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import SearchFilter from '../../../../components/SearchFilter';
import CreateTeam from './CreateTeam';
import type { Organization, Team } from '../../../../utils/api-types';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { Option } from '../../../../utils/Option';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';

const useStyles = makeStyles(() => ({
  createButton: {
    float: 'left',
    marginTop: -15,
  },
  box: {
    width: '100%',
    minHeight: '100%',
    padding: 20,
    border: '1px dashed rgba(255, 255, 255, 0.3)',
  },
  chip: {
    margin: '0 10px 10px 0',
  },
}));

interface Props {
  addedTeamIds: Team['team_id'][];
  onAddTeams: (teamIds: Team['team_id'][]) => Promise<void>,
}

interface TeamStoreExtended extends TeamStore {
  organization_name: Organization['organization_name'];
  organization_description: Organization['organization_description']
}

const AddTeams: React.FC<Props> = ({ addedTeamIds, onAddTeams }) => {
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [teamIds, setTeamIds] = useState<Team['team_id'][]>([]);
  const [tags, setTags] = useState<Option[]>([]);
  const { teamsMap, organizationsMap }: {
    organizationsMap: Record<string, Organization>,
    teamsMap: Record<string, TeamStore>
  } = useHelper((helper: TeamsHelper & OrganizationHelper) => ({
    teamsMap: helper.getTeamsMap(),
    organizationsMap: helper.getOrganizationsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchTeams());
  });
  const submitAddTeams = async () => {
    await onAddTeams(teamIds);
    setOpen(false);
  };

  const filterByKeyword = (n: TeamStoreExtended) => keyword === ''
    || (n.team_name || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    || (n.team_description || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    || (n.organization_name || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    || (n.organization_description || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
  const filteredTeams = R.pipe(
    R.filter((u: TeamStore) => !(u.team_contextual && !addedTeamIds.includes(u.team_id))),
    R.map((u: TeamStore) => ({
      organization_name:
        u.team_organization ? (organizationsMap[u.team_organization]?.organization_name ?? '-') : '-',
      organization_description:
        u.team_organization ? (organizationsMap[u.team_organization]?.organization_description
          ?? '-') : '-',
      ...u,
    })),
    R.filter(
      (n: TeamStoreExtended) => tags.length === 0
        || R.any(
          (filter: Option['id']) => R.includes(filter, n.team_tags),
          R.pluck('id', tags),
        ),
    ),
    R.filter(filterByKeyword),
    R.take(10),
  )(R.values(teamsMap));
  return (
    <>
      <IconButton
        color="primary"
        aria-label="Add"
        onClick={() => setOpen(true)}
        classes={{ root: classes.createButton }}
        size="large"
      >
        <Add fontSize="small" />
      </IconButton>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={() => {
          setOpen(false);
          setKeyword('');
          setTeamIds([]);
        }}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          elevation: 1,
          sx: {
            minHeight: 580,
            maxHeight: 580,
          },
        }}
      >
        <DialogTitle>{t('Add teams')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{ marginTop: -15 }}>
            <Grid item xs={8}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <SearchFilter
                    onChange={(value?: string) => setKeyword(value || '')}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TagsFilter
                    onAddTag={(value: Option) => {
                      if (value) {
                        setTags([...tags, value]);
                      }
                    }}
                    onClearTag={() => setTags([])}
                    currentTags={tags}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <List>
                {filteredTeams.map((team: TeamStoreExtended) => {
                  const disabled = teamIds.includes(team.team_id)
                    || addedTeamIds.includes(team.team_id);
                  return (
                    <ListItem
                      key={team.team_id}
                      disabled={disabled}
                      button
                      divider
                      dense
                      onClick={() => setTeamIds([...teamIds, team.team_id])}
                    >
                      <ListItemIcon>
                        <GroupsOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={team.team_name}
                        secondary={team.organization_name}
                      />
                      <ItemTags variant="reduced-view" tags={team.team_tags} />
                    </ListItem>
                  );
                })}
                <CreateTeam
                  inline
                  onCreate={(team) => setTeamIds([...teamIds, team.team_id])}
                />
              </List>
            </Grid>
            <Grid item xs={4}>
              <Box className={classes.box}>
                {teamIds.map((teamId) => {
                  const team = teamsMap[teamId];
                  const teamGravatar = R.propOr('-', 'team_gravatar', team);
                  return (
                    <Chip
                      key={teamId}
                      onDelete={() => {
                        setTeamIds((prevIds) => prevIds.filter((id) => id !== teamId));
                      }}
                      label={truncate(team.team_name, 22)}
                      avatar={<Avatar src={teamGravatar} sx={{ height: '32px', width: '32px' }} />}
                      classes={{ root: classes.chip }}
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setKeyword('');
            setTeamIds([]);
          }}
          >{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitAddTeams}>
            {t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTeams;
