import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Button, Chip, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Box, ListItemIcon, Grid } from '@mui/material';
import { ControlPointOutlined, EmojiEventsOutlined } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeHelper } from '../../../../actions/Schema';
import { fetchChallenges } from '../../../../actions/Challenge';
import CreateChallenge from '../../components/challenges/CreateChallenge';
import { truncate } from '../../../../utils/String';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import Transition from '../../../../components/common/Transition';
import TagsFilter from '../../../../components/TagsFilter';

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
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

class InjectAddChallenges extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      keyword: '',
      challengesIds: [],
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchChallenges();
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false, keyword: '', challengesIds: [] });
  }

  handleSearchChallenges(value) {
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

  addChallenge(challengeId) {
    this.setState({
      challengesIds: R.append(challengeId, this.state.challengesIds),
    });
  }

  removeChallenge(challengeId) {
    this.setState({
      challengesIds: R.filter(
        (u) => u !== challengeId,
        this.state.challengesIds,
      ),
    });
  }

  submitAddChallenges() {
    this.props.handleAddChallenges(this.state.challengesIds);
    this.handleClose();
  }

  onCreate(result) {
    this.addChallenge(result);
  }

  render() {
    const {
      classes,
      t,
      challenges,
      injectChallengesIds,
      challengesMap,
      exercise,
    } = this.props;
    const { keyword, challengesIds, tags } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.challenge_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.challenge_content || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.challenge_category || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const filteredChallenges = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.challenge_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      R.take(10),
    )(challenges);
    return (
      <div>
        <ListItem
          classes={{ root: classes.item }}
          button={true}
          divider={true}
          onClick={this.handleOpen.bind(this)}
          color="primary"
          disabled={isExerciseReadOnly(exercise)}
        >
          <ListItemIcon color="primary">
            <ControlPointOutlined color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('Add challenges')}
            classes={{ primary: classes.text }}
          />
        </ListItem>
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
          <DialogTitle>{t('Add challenge in this inject')}</DialogTitle>
          <DialogContent>
            <Grid container={true} spacing={3} style={{ marginTop: -15 }}>
              <Grid item={true} xs={8}>
                <Grid container={true} spacing={3}>
                  <Grid item={true} xs={6}>
                    <SearchFilter
                      onChange={this.handleSearchChallenges.bind(this)}
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
                  {filteredChallenges.map((challenge) => {
                    const disabled = challengesIds.includes(challenge.challenge_id)
                      || injectChallengesIds.includes(challenge.challenge_id);
                    return (
                      <ListItem
                        key={challenge.challenge_id}
                        disabled={disabled}
                        button={true}
                        divider={true}
                        dense={true}
                        onClick={this.addChallenge.bind(
                          this,
                          challenge.challenge_id,
                        )}
                      >
                        <ListItemIcon>
                          <EmojiEventsOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={challenge.challenge_name}
                          secondary={challenge.challenge_category}
                        />
                      </ListItem>
                    );
                  })}
                  <CreateChallenge
                    inline={true}
                    onCreate={this.onCreate.bind(this)}
                  />
                </List>
              </Grid>
              <Grid item={true} xs={4}>
                <Box className={classes.box}>
                  {this.state.challengesIds.map((challengeId) => {
                    const challenge = challengesMap[challengeId];
                    return (
                      <Chip
                        key={challengeId}
                        onDelete={this.removeChallenge.bind(this, challengeId)}
                        label={truncate(challenge?.challenge_name || '', 22)}
                        icon={<EmojiEventsOutlined />}
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
              onClick={this.submitAddChallenges.bind(this)}
            >
              {t('Add')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

InjectAddChallenges.propTypes = {
  t: PropTypes.func,
  fetchChallenges: PropTypes.func,
  handleAddChallenges: PropTypes.func,
  challenges: PropTypes.array,
  injectChallengesIds: PropTypes.array,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { exerciseId } = ownProps;
  const exercise = helper.getExercise(exerciseId);
  const challenges = helper.getChallenges();
  const challengesMap = helper.getChallengesMap();
  return { challenges, challengesMap, exercise };
};

export default R.compose(
  connect(select, { fetchChallenges }),
  inject18n,
  withStyles(styles),
)(InjectAddChallenges);
