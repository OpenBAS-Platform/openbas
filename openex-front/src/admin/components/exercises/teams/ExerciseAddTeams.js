import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Button, Slide, Chip, Avatar, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Box, ListItemIcon, Grid, Fab } from '@mui/material';
import { Add, PersonOutlined } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import { updateExerciseTeams } from '../../../../actions/Exercise';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeHelper } from '../../../../actions/Schema';
import { fetchTeams } from '../../../../actions/Team';
import CreateTeam from '../../persons/teams/CreateTeam';
import { truncate } from '../../../../utils/String';
import ItemTags from '../../../../components/ItemTags';
import TagsFilter from '../../../../components/TagsFilter';

const styles = () => ({
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
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class TeamAddTeams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      keyword: '',
      teamsIds: [],
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchTeams();
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false, keyword: '', teamsIds: [] });
  }

  handleSearchTeams(value) {
    this.setState({ keyword: value });
  }

  handleAddTag(value) {
    if (value) {
      this.setState({ tags: [value] });
    }
  }

  handleClearTag() {
    this.setState({ tags: [] });
  }

  addTeam(teamId) {
    this.setState({ teamsIds: R.append(teamId, this.state.teamsIds) });
  }

  removeTeam(teamId) {
    this.setState({
      teamsIds: R.filter((u) => u !== teamId, this.state.teamsIds),
    });
  }

  submitAddTeams() {
    this.props.updateExerciseTeams(
      this.props.exerciseId,
      {
        exercise_teams: R.uniq([
          ...this.props.exerciseTeamsIds,
          ...this.state.teamsIds,
        ]),
      },
    );
    this.handleClose();
  }

  onCreate(result) {
    this.addTeam(result);
  }

  render() {
    const {
      classes,
      t,
      teamsMap,
      exerciseTeamsIds,
      organizationsMap,
    } = this.props;
    const { keyword, teamsIds, tags } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.team_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.team_description || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
        !== -1
      || (n.organization_name || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.organization_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
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
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
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
                      onChange={this.handleSearchTeams.bind(this)}
                      fullWidth={true}
                    />
                  </Grid>
                  <Grid item={true} xs={6}>
                    <TagsFilter
                      onAddTag={this.handleAddTag.bind(this)}
                      onClearTag={this.handleClearTag.bind(this)}
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
                        onClick={this.addTeam.bind(this, team.team_id)}
                      >
                        <ListItemIcon>
                          <PersonOutlined />
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
                    onCreate={this.onCreate.bind(this)}
                  />
                </List>
              </Grid>
              <Grid item={true} xs={4}>
                <Box className={classes.box}>
                  {this.state.teamsIds.map((teamId) => {
                    const team = teamsMap[teamId];
                    const teamGravatar = R.propOr('-', 'team_gravatar', team);
                    return (
                      <Chip
                        key={teamId}
                        onDelete={this.removeTeam.bind(this, teamId)}
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
            <Button onClick={this.handleClose.bind(this)}>{t('Cancel')}</Button>
            <Button color="secondary" onClick={this.submitAddTeams.bind(this)}>
              {t('Add')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

TeamAddTeams.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  updateExerciseTeams: PropTypes.func,
  fetchTeams: PropTypes.func,
  organizations: PropTypes.array,
  teamsMap: PropTypes.object,
  exerciseTeamsIds: PropTypes.array,
};

const select = (state) => {
  const helper = storeHelper(state);
  return {
    teamsMap: helper.getTeamsMap(),
    organizationsMap: helper.getOrganizationsMap(),
  };
};

export default R.compose(
  connect(select, { updateExerciseTeams, fetchTeams }),
  inject18n,
  withStyles(styles),
)(TeamAddTeams);
