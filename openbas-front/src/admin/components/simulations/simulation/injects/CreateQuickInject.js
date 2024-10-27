import { Add } from '@mui/icons-material';
import { Drawer, Fab } from '@mui/material';
import { withStyles, withTheme } from '@mui/styles';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Component } from 'react';
import { connect } from 'react-redux';

import { fetchExercises } from '../../../../../actions/Exercise';
import { fetchInjectorContract } from '../../../../../actions/InjectorContracts';
import { storeHelper } from '../../../../../actions/Schema';
import { fetchTags } from '../../../../../actions/Tag';
import inject18n from '../../../../../components/i18n';
import QuickInject, { EMAIL_CONTRACT } from './QuickInject';

const styles = theme => ({
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

  componentDidMount() {
    this.props.fetchInjectorContract(EMAIL_CONTRACT);
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    const { classes, exercise, injectorContract, exercisesMap, tagsMap } = this.props;
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
        {injectorContract
        && (
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
              injectorContract={injectorContract}
              handleClose={this.handleClose.bind(this)}
              exercisesMap={exercisesMap}
              tagsMap={tagsMap}
            />
          </Drawer>
        )}
      </>
    );
  }
}

CreateQuickInject.propTypes = {
  t: PropTypes.func,
  exercise: PropTypes.object,
  exercisesMap: PropTypes.object,
  tagsMap: PropTypes.object,
  injectorContract: PropTypes.object,
};

const select = (state) => {
  const helper = storeHelper(state);
  return {
    exercisesMap: helper.getExercisesMap(),
    tagsMap: helper.getTagsMap(),
    injectorContract: helper.getInjectorContract(EMAIL_CONTRACT),
  };
};

export default R.compose(
  connect(select, {
    fetchExercises,
    fetchTags,
    fetchInjectorContract,
  }),
  inject18n,
  withTheme,
  withStyles(styles),
)(CreateQuickInject);
