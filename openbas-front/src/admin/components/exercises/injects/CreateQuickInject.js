import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab, Drawer } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Add } from '@mui/icons-material';
import { withTheme } from '@mui/styles';
import { fetchInjectTypes } from '../../../../actions/Inject';
import inject18n from '../../../../components/i18n';
import QuickInject from './QuickInject';
import { storeHelper } from '../../../../actions/Schema';
import { fetchExercises } from '../../../../actions/Exercise';
import { fetchTags } from '../../../../actions/Tag';

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
});

class CreateQuickInject extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    const { classes, exercise, injectTypes, exercisesMap, tagsMap } = this.props;
    const { open } = this.state;
    return (
      <>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
          disabled={exercise.exercise_status !== 'RUNNING'}
        >
          <Add />
        </Fab>
        <Drawer
          open={open}
          keepMounted={false}
          anchor="right"
          sx={{ zIndex: 1202 }}
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}
          elevation={1}
          disableEnforceFocus={true}
        >
          <QuickInject
            exerciseId={exercise.exercise_id}
            exercise={exercise}
            injectTypes={injectTypes}
            handleClose={this.handleClose.bind(this)}
            exercisesMap={exercisesMap}
            tagsMap={tagsMap}
          />
        </Drawer>
      </>
    );
  }
}

CreateQuickInject.propTypes = {
  t: PropTypes.func,
  exercise: PropTypes.object,
  exercisesMap: PropTypes.object,
  injectTypes: PropTypes.array,
  tagsMap: PropTypes.object,
};

const select = (state) => {
  const helper = storeHelper(state);
  return {
    exercisesMap: helper.getExercisesMap(),
    injectTypes: helper.getInjectTypes(),
    tagsMap: helper.getTagsMap(),
  };
};

export default R.compose(
  connect(select, {
    fetchExercises,
    fetchTags,
    fetchInjectTypes,
  }),
  inject18n,
  withTheme,
  withStyles(styles),
)(CreateQuickInject);
