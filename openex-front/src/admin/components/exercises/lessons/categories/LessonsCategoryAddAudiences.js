import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Add, CastForEducationOutlined } from '@mui/icons-material';
import Box from '@mui/material/Box';
import withStyles from '@mui/styles/withStyles';
import { ListItemIcon } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import SearchFilter from '../../../../../components/SearchFilter';
import inject18n from '../../../../../components/i18n';
import { storeHelper } from '../../../../../actions/Schema';
import { fetchAudiences } from '../../../../../actions/Audience';
import CreateAudience from '../../audiences/CreateAudience';
import { truncate } from '../../../../../utils/String';
import { Transition } from '../../../../../utils/Environment';
import TagsFilter from '../../../../../components/TagsFilter';
import ItemTags from '../../../../../components/ItemTags';

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

class LessonsCategoryAddAudiences extends Component {
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

  addAllAudiences() {
    const { lessonsCategoryAudiencesIds, audiences } = this.props;
    const audiencesToAdd = R.pipe(
      R.map((n) => n.audience_id),
      R.filter((n) => !lessonsCategoryAudiencesIds.includes(n)),
    )(audiences);
    this.setState({
      audiencesIds: audiencesToAdd,
    });
  }

  removeAudience(audienceId) {
    this.setState({
      audiencesIds: R.filter((u) => u !== audienceId, this.state.audiencesIds),
    });
  }

  submitAddAudiences() {
    const {
      lessonsCategoryAudiencesIds,
      lessonsCategoryId,
      handleUpdateAudiences,
    } = this.props;
    handleUpdateAudiences(lessonsCategoryId, [
      ...lessonsCategoryAudiencesIds,
      ...this.state.audiencesIds,
    ]);
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
      lessonsCategoryAudiencesIds,
      exerciseId,
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
              {t('Add target audiences in this lessons learned category')}
            </div>
            <div style={{ float: 'right', marginTop: -4 }}>
              <Button
                onClick={this.addAllAudiences.bind(this)}
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
                      || lessonsCategoryAudiencesIds.includes(
                        audience.audience_id,
                      );
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

LessonsCategoryAddAudiences.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  fetchAudiences: PropTypes.func,
  handleUpdateAudiences: PropTypes.func,
  organizations: PropTypes.array,
  audiences: PropTypes.array,
  lessonsCategoryId: PropTypes.string,
  lessonsCategoryAudiencesIds: PropTypes.array,
  attachment: PropTypes.bool,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { exerciseId } = ownProps;
  const audiences = helper.getExerciseAudiences(exerciseId);
  const audiencesMap = helper.getAudiencesMap();
  return { audiences, audiencesMap };
};

export default R.compose(
  connect(select, { fetchAudiences }),
  inject18n,
  withStyles(styles),
)(LessonsCategoryAddAudiences);
