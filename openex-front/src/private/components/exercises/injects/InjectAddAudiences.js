import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  CastForEducationOutlined,
  ControlPointOutlined,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import withStyles from '@mui/styles/withStyles';
import { ListItemIcon } from '@mui/material';
import Grid from '@mui/material/Grid';
import { updateInjectAudiences } from '../../../../actions/Inject';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeBrowser } from '../../../../actions/Schema';
import { fetchAudiences } from '../../../../actions/Audience';
import CreateAudience from '../audiences/CreateAudience';
import { truncate } from '../../../../utils/String';
import { isExerciseReadOnly } from '../../../../utils/Exercise';

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

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class InjectAddAudiences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      keyword: '',
      audiencesIds: [],
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
    this.props.updateInjectAudiences(
      this.props.exerciseId,
      this.props.injectId,
      {
        inject_audiences: R.uniq([
          ...this.props.injectAudiencesIds,
          ...this.state.audiencesIds,
        ]),
      },
    );
    this.handleClose();
  }

  onCreate(result) {
    this.addAudience(result);
  }

  render() {
    const {
      classes, t, audiences, injectAudiencesIds, exerciseId, exercise,
    } = this.props;
    const { keyword, audiencesIds } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.audience_email || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.audience_firstname || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.audience_lastname || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.audience_phone || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.audience_organization || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const filteredAudiences = R.pipe(
      R.filter(filterByKeyword),
      R.take(5),
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
          keepMounted={true}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{
            sx: {
              minHeight: 540,
              maxHeight: 540,
            },
          }}
        >
          <DialogTitle>{t('Add target audiences in this inject')}</DialogTitle>
          <DialogContent>
            <Grid container={true} spacing={3} style={{ marginTop: -15 }}>
              <Grid item={true} xs={8}>
                <SearchFilter
                  onChange={this.handleSearchAudiences.bind(this)}
                  fullWidth={true}
                />
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
                    const audience = this.props.browser.getAudience(audienceId);
                    return (
                      <Chip
                        key={audienceId}
                        onDelete={this.removeAudience.bind(this, audienceId)}
                        label={truncate(audience.audience_name, 22)}
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
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleClose.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
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
  injectId: PropTypes.string,
  updateInjectAudiences: PropTypes.func,
  fetchAudiences: PropTypes.func,
  organizations: PropTypes.array,
  audiences: PropTypes.array,
  injectAudiencesIds: PropTypes.array,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { exerciseId } = ownProps;
  const exercise = browser.getExercise(exerciseId);
  return {
    exercise,
    audiences: exercise.audiences,
    browser,
  };
};

export default R.compose(
  connect(select, { updateInjectAudiences, fetchAudiences }),
  inject18n,
  withStyles(styles),
)(InjectAddAudiences);
