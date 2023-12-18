import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Button, Chip, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Box, ListItemIcon, Grid } from '@mui/material';
import { CastForEducationOutlined, ControlPointOutlined } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeHelper } from '../../../../actions/Schema';
import { fetchAudiences } from '../../../../actions/Audience';
import CreateAudience from '../audiences/CreateAudience';
import { truncate } from '../../../../utils/String';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import { Transition } from '../../../../utils/Environment';
import TagsFilter from '../../../../components/TagsFilter';
import ItemTags from '../../../../components/ItemTags';

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

class InjectAddAudiences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      keyword: '',
      audiencesIds: [],
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false, keyword: '', audiencesIds: [] });
  }

  handleSearchAudiences(value) {
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

  addAudience(audienceId) {
    this.setState({
      audiencesIds: R.append(audienceId, this.state.audiencesIds),
    });
  }

  removeAudience(audienceId) {
    this.setState({
      audiencesIds: R.filter((u) => u !== audienceId, this.state.audiencesIds),
    });
  }

  submitAddAudiences() {
    this.props.handleAddAudiences(this.state.audiencesIds);
    this.handleClose();
  }

  onCreate(result) {
    this.addAudience(result);
  }

  render() {
    const {
      classes,
      t,
      audiences,
      injectAudiencesIds,
      exerciseId,
      exercise,
      audiencesMap,
    } = this.props;
    const { keyword, audiencesIds, tags } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.audience_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.audience_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const filteredAudiences = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.audience_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      R.take(10),
    )(audiences);
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
            primary={t('Add target audiences')}
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
          <DialogTitle>{t('Add target audiences in this inject')}</DialogTitle>
          <DialogContent>
            <Grid container={true} spacing={3} style={{ marginTop: -15 }}>
              <Grid item={true} xs={8}>
                <Grid container={true} spacing={3}>
                  <Grid item={true} xs={6}>
                    <SearchFilter
                      onChange={this.handleSearchAudiences.bind(this)}
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
                  {filteredAudiences.map((audience) => {
                    const disabled = audiencesIds.includes(audience.audience_id)
                      || injectAudiencesIds.includes(audience.audience_id);
                    return (
                      <ListItem
                        key={audience.audience_id}
                        disabled={disabled}
                        button={true}
                        divider={true}
                        dense={true}
                        onClick={this.addAudience.bind(
                          this,
                          audience.audience_id,
                        )}
                      >
                        <ListItemIcon>
                          <CastForEducationOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={audience.audience_name}
                          secondary={audience.audience_description}
                        />
                        <ItemTags
                          variant="list"
                          tags={audience.audience_tags}
                        />
                      </ListItem>
                    );
                  })}
                  <CreateAudience
                    exerciseId={exerciseId}
                    inline={true}
                    onCreate={this.onCreate.bind(this)}
                  />
                </List>
              </Grid>
              <Grid item={true} xs={4}>
                <Box className={classes.box}>
                  {this.state.audiencesIds.map((audienceId) => {
                    const audience = audiencesMap[audienceId];
                    return (
                      <Chip
                        key={audienceId}
                        onDelete={this.removeAudience.bind(this, audienceId)}
                        label={truncate(audience?.audience_name || '', 22)}
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
              onClick={this.submitAddAudiences.bind(this)}
            >
              {t('Add')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

InjectAddAudiences.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  fetchAudiences: PropTypes.func,
  handleAddAudiences: PropTypes.func,
  organizations: PropTypes.array,
  audiences: PropTypes.array,
  injectAudiencesIds: PropTypes.array,
  attachment: PropTypes.bool,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { exerciseId } = ownProps;
  const exercise = helper.getExercise(exerciseId);
  const audiences = helper.getExerciseAudiences(exerciseId);
  const audiencesMap = helper.getAudiencesMap();
  return { exercise, audiences, audiencesMap };
};

export default R.compose(
  connect(select, { fetchAudiences }),
  inject18n,
  withStyles(styles),
)(InjectAddAudiences);
