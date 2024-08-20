import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Button, Chip, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Box, ListItemIcon, Grid, IconButton } from '@mui/material';
import { Add, CastForEducationOutlined } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import SearchFilter from '../../../../../../components/SearchFilter';
import inject18n from '../../../../../../components/i18n';
import { storeHelper } from '../../../../../../actions/Schema';
import { fetchTeams } from '../../../../../../actions/teams/team-actions';
import CreateTeam from '../../../../components/teams/CreateTeam';
import { truncate } from '../../../../../../utils/String';
import TagsFilter from '../../../../common/filters/TagsFilter';
import ItemTags from '../../../../../../components/ItemTags';
import Transition from '../../../../../../components/common/Transition';

const styles = (theme) => ({
  createButton: {
    float: 'left',
    margin: '-15px 0 0 5px',
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
  item: {
    paddingLeft: 10,
    height: 50,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
});

class LessonsCategoryAddTeams extends Component {
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
    this.props.fetchTeams(this.props.exerciseId);
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
    this.setState({
      teamsIds: R.append(teamId, this.state.teamsIds),
    });
  }

  addAllTeams() {
    const { lessonsCategoryTeamsIds, teams } = this.props;
    const teamsToAdd = R.pipe(
      R.map((n) => n.team_id),
      R.filter((n) => !lessonsCategoryTeamsIds.includes(n)),
    )(teams);
    this.setState({
      teamsIds: teamsToAdd,
    });
  }

  removeTeam(teamId) {
    this.setState({
      teamsIds: R.filter((u) => u !== teamId, this.state.teamsIds),
    });
  }

  submitAddTeams() {
    const {
      lessonsCategoryTeamsIds,
      lessonsCategoryId,
      handleUpdateTeams,
    } = this.props;
    handleUpdateTeams(lessonsCategoryId, [
      ...lessonsCategoryTeamsIds,
      ...this.state.teamsIds,
    ]);
    this.handleClose();
  }

  onCreate(result) {
    this.addTeam(result.team_id);
  }

  render() {
    const {
      classes,
      t,
      teams,
      lessonsCategoryTeamsIds,
      exerciseId,
      teamsMap,
    } = this.props;
    const { keyword, teamsIds, tags } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.team_name || '').toLowerCase().indexOf(keyword.toLowerCase())
      !== -1
      || (n.team_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const filteredTeams = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.team_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      R.take(10),
    )(teams);
    return (
      <div>
        <IconButton
          classes={{ root: classes.createButton }}
          onClick={this.handleOpen.bind(this)}
          aria-haspopup="true"
          size="large"
          color="secondary"
        >
          <Add fontSize="small" />
        </IconButton>
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
          <DialogTitle>
            <div style={{ float: 'left' }}>
              {t('Add target teams in this lessons learned category')}
            </div>
            <div style={{ float: 'right', marginTop: -4 }}>
              <Button
                onClick={this.addAllTeams.bind(this)}
                variant="outlined"
                color="warning"
              >
                {t('Select all')}
              </Button>
            </div>
          </DialogTitle>
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
                      || lessonsCategoryTeamsIds.includes(
                        team.team_id,
                      );
                    return (
                      <ListItem
                        key={team.team_id}
                        disabled={disabled}
                        button={true}
                        divider={true}
                        dense={true}
                        onClick={this.addTeam.bind(
                          this,
                          team.team_id,
                        )}
                      >
                        <ListItemIcon>
                          <CastForEducationOutlined />
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
                    exerciseId={exerciseId}
                    inline={true}
                    onCreate={this.onCreate.bind(this)}
                  />
                </List>
              </Grid>
              <Grid item={true} xs={4}>
                <Box className={classes.box}>
                  {this.state.teamsIds.map((teamId) => {
                    const team = teamsMap[teamId];
                    return (
                      <Chip
                        key={teamId}
                        onDelete={this.removeTeam.bind(this, teamId)}
                        label={truncate(team?.team_name || '', 22)}
                        icon={<CastForEducationOutlined />}
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
            <Button
              color="secondary"
              onClick={this.submitAddTeams.bind(this)}
            >
              {t('Add')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

LessonsCategoryAddTeams.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  fetchTeams: PropTypes.func,
  handleUpdateTeams: PropTypes.func,
  organizations: PropTypes.array,
  teams: PropTypes.array,
  lessonsCategoryId: PropTypes.string,
  lessonsCategoryTeamsIds: PropTypes.array,
  attachment: PropTypes.bool,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { exerciseId } = ownProps;
  const teams = helper.getExerciseTeams(exerciseId);
  const teamsMap = helper.getTeamsMap();
  return { teams, teamsMap };
};

export default R.compose(
  connect(select, { fetchTeams }),
  inject18n,
  withStyles(styles),
)(LessonsCategoryAddTeams);
