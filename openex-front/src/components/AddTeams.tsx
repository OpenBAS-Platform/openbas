import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Button, Slide, Chip, Avatar, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Box, ListItemIcon, Grid, Fab } from '@mui/material';
import { Add, GroupsOutlined } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import { makeStyles } from '@mui/styles';
import { truncate } from '../utils/String';
import ItemTags from './ItemTags';
import TagsFilter from './TagsFilter';
import { useAppDispatch } from '../utils/hooks';
import useDataLoader from '../utils/ServerSideEvent';
import { fetchScenarioTeams } from '../actions/scenarios/scenario-actions';
import type { Theme } from './Theme';
import Transition from './common/Transition';
import { useFormatter } from './i18n';
import { useHelper } from '../store';
import { OrganizationsHelper, TeamsHelper } from '../actions/helper';
import { fetchTeams } from '../actions/Team';
import SearchFilter from './SearchFilter';
import CreateTeam from '../admin/components/teams/teams/CreateTeam';

const useStyles = makeStyles((theme: Theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
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

const AddTeams = ({
  exerciseTeamsIds,
  exerciseId,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [teamsIds, setTeamsIds] = useState([]);
  const [tags, setTags] = useState([]);

  const { teamsMap, organizationsMap } = useHelper((helper: TeamsHelper & OrganizationsHelper) => ({
    teamsMap: helper.getTeamsMap(),
    organizationsMap: helper.getOrganizationsMap(),
  }));

  useDataLoader(() => {
    dispatch(fetchTeams(scenarioId));
  });

  const submitAddTeams = () => {

  };

  const filterByKeyword = (n) => keyword === ''
    || (n.team_name || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    || (n.team_description || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    || (n.organization_name || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    || (n.organization_description || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
  const filteredTeams = R.pipe(
    R.map((u) => ({
      organization_name:
        organizationsMap[u.team_organization]?.organization_name ?? '-',
      organization_description:
        organizationsMap[u.team_organization]?.organization_description
        ?? '-',
      ...u,
    })),
    R.filter(
      (n) => tags.length === 0
        || R.any(
          (filter) => R.includes(filter, n.team_tags),
          R.pluck('id', tags),
        ),
    ),
    R.filter(filterByKeyword),
    R.take(10),
  )(R.values(teamsMap));

  return (
    <>
      <Fab
        onClick={() => setOpen(true)}
        color="primary"
        aria-label="Add"
        className={classes.createButton}
      >
        <Add />
      </Fab>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={() => {
          setOpen(false);
          setKeyword('');
          setTeamsIds([]);
        }}
        fullWidth={true}
        maxWidth="lg"
        PaperProps={{
          elevation: 1,
          sx: {
            minHeight: 580,
            maxHeight: 580,
          },
        }}
      >
        <DialogTitle>{t('Add teams in this exercise')}</DialogTitle>
        <DialogContent>
          <Grid container={true} spacing={3} style={{ marginTop: -15 }}>
            <Grid item={true} xs={8}>
              <Grid container={true} spacing={3}>
                <Grid item={true} xs={6}>
                  <SearchFilter
                    onChange={setKeyword}
                    fullWidth={true}
                  />
                </Grid>
                <Grid item={true} xs={6}>
                  <TagsFilter
                    onAddTag={(value) => {
                      if (value) {
                        setTags([value]);
                      }
                    }}
                    onClearTag={() => setTags([])}
                    currentTags={tags}
                    fullWidth={true}
                  />
                </Grid>
              </Grid>
              <List>
                {filteredTeams.map((team) => {
                  const disabled = teamsIds.includes(team.team_id)
                    || exerciseTeamsIds.includes(team.team_id);
                  return (
                    <ListItem
                      key={team.team_id}
                      disabled={disabled}
                      button={true}
                      divider={true}
                      dense={true}
                      onClick={(teamId) => setTeamsIds([...teamIds, team.teamId])}
                    >
                      <ListItemIcon>
                        <GroupsOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={team.team_name}
                        secondary={team.organization_name}
                      />
                      <ItemTags variant="list" tags={team.team_tags} />
                    </ListItem>
                  );
                })}
                <CreateTeam
                  inline={true}
                  onCreate={(teamId) => setTeamsIds([...teamIds, teamId])}
                  exerciseId={exerciseId}
                />
              </List>
            </Grid>
            <Grid item={true} xs={4}>
              <Box className={classes.box}>
                {teamsIds.map((teamId) => {
                  const team = teamsMap[teamId];
                  const teamGravatar = R.propOr('-', 'team_gravatar', team);
                  return (
                    <Chip
                      key={teamId}
                      onDelete={() => {
                        const teamIdsTmp = teamsIds;
                        teamIdsTmp.splice(teamId);
                        setTeamsIds(teamIdsTmp);
                      }}
                      label={truncate(team.team_name, 22)}
                      avatar={<Avatar src={teamGravatar} size={32} />}
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
            setTeamsIds([]);
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

// TeamAddTeams.propTypes = {
//   t: PropTypes.func,
//   exerciseId: PropTypes.string,
//   addExerciseTeams: PropTypes.func,
//   fetchTeams: PropTypes.func,
//   organizations: PropTypes.array,
//   teamsMap: PropTypes.object,
//   exerciseTeamsIds: PropTypes.array,
// };
