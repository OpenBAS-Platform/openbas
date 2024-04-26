import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { ControlPointOutlined, GroupsOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../../../../components/SearchFilter';
import { useFormatter } from '../../../../components/i18n';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import CreateTeam from '../teams/CreateTeam';
import { truncate } from '../../../../utils/String';
import Transition from '../../../../components/common/Transition';
import TagsFilter from '../../../../components/TagsFilter';
import ItemTags from '../../../../components/ItemTags';
import type { Theme } from '../../../../components/Theme';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import type { Option } from '../../../../utils/Option';
import { PermissionsContext, TeamContext } from '../Context';
import type { TeamStore } from '../../../../actions/teams/Team';
import { useHelper } from '../../../../store';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    width: '100%',
    minHeight: '100%',
    padding: 20,
    border: '1px dashed rgba(255, 255, 255, 0.3)',
  },
  chip: {
    margin: '0 10px 10px 0',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

interface Props {
  disabled: boolean
  handleAddTeams: (teamIds: string[]) => void;
  injectTeamsIds: string[]
  teams: TeamStore[]
}

const InjectAddTeams: FunctionComponent<Props> = ({
  disabled,
  handleAddTeams,
  injectTeamsIds,
  teams,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);
  const { onAddTeam } = useContext(TeamContext);

  const teamsMap = useHelper((helper: TeamsHelper) => helper.getTeamsMap());

  useDataLoader(() => {
    dispatch(fetchTeams());
  });

  const [open, setopen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [teamsIds, setTeamsIds] = useState<string[]>([]);
  const [tags, setTags] = useState<Option[]>([]);

  const handleOpen = () => setopen(true);

  const handleClose = () => {
    setopen(false);
    setKeyword('');
    setTeamsIds([]);
  };

  const handleSearchTeams = (value: string) => {
    setKeyword(value);
  };

  const handleAddTag = (value: Option) => {
    if (value) {
      setTags([value]);
    }
  };

  const handleClearTag = () => {
    setTags([]);
  };

  const addTeam = (teamId: string) => {
    setTeamsIds(R.append(teamId, teamsIds));
  };

  const removeTeam = (teamId: string) => {
    setTeamsIds(teamsIds.filter((u) => u !== teamId));
  };

  const submitAddTeams = () => {
    handleAddTeams(teamsIds);
    handleClose();
  };

  const onCreate = async (result: string) => {
    addTeam(result);
    await onAddTeam(result);
  };

  const filterByKeyword = (n: TeamStore) => keyword === ''
    || (n.team_name || '').toLowerCase().indexOf(keyword.toLowerCase())
    !== -1
    || (n.team_description || '')
      .toLowerCase()
      .indexOf(keyword.toLowerCase()) !== -1;
  const filteredTeams = R.pipe(
    R.filter(
      (n: TeamStore) => tags.length === 0
        || R.any(
          (filter: string) => R.includes(filter, n.team_tags),
          R.pluck('id', tags),
        ),
    ),
    R.filter(filterByKeyword),
    R.take(10),
  )(teams);
  return (
    <div>
      <ListItem
        classes={{ root: classes.item }}
        button
        divider
        onClick={handleOpen}
        color="primary"
        disabled={permissions.readOnly || disabled}
      >
        <ListItemIcon color="primary">
          <ControlPointOutlined color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('Add target teams')}
          classes={{ primary: classes.text }}
        />
      </ListItem>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
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
        <DialogTitle>{t('Add target teams in this inject')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{ marginTop: -15 }}>
            <Grid item xs={8}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <SearchFilter
                    onChange={handleSearchTeams}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TagsFilter
                    onAddTag={handleAddTag}
                    onClearTag={handleClearTag}
                    currentTags={tags}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <List>
                {filteredTeams.map((team: TeamStore) => {
                  const teamDisabled = teamsIds.includes(team.team_id)
                    || injectTeamsIds.includes(team.team_id);
                  return (
                    <ListItem
                      key={team.team_id}
                      disabled={teamDisabled}
                      button
                      divider
                      dense
                      onClick={() => addTeam(team.team_id)}
                    >
                      <ListItemIcon>
                        <GroupsOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={team.team_name}
                        secondary={team.team_description}
                      />
                      <ItemTags
                        variant="list"
                        tags={team.team_tags}
                      />
                    </ListItem>
                  );
                })}
                <CreateTeam
                  inline
                  onCreate={onCreate}
                />
              </List>
            </Grid>
            <Grid item xs={4}>
              <Box className={classes.box}>
                {teamsIds.map((teamId) => {
                  const team = teamsMap[teamId];
                  return (
                    <Chip
                      key={teamId}
                      onDelete={() => removeTeam(teamId)}
                      label={truncate(team?.team_name || '', 22)}
                      icon={<GroupsOutlined />}
                      classes={{ root: classes.chip }}
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('Cancel')}</Button>
          <Button
            color="secondary"
            onClick={submitAddTeams}
          >
            {t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default InjectAddTeams;
