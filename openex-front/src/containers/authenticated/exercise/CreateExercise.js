import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Add } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import { T } from '../../../components/I18n';
import { i18nRegister } from '../../../utils/Messages';
import ExerciseForm from './ExerciseForm';
import { addExercise } from '../../../actions/Exercise';
import { submitForm } from '../../../utils/Action';

i18nRegister({
  fr: {
    'Create a new exercise': 'Créer un nouvel exercice',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
});

class CreateExercise extends Component {
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

  onSubmit(data) {
    return this.props
      .addExercise(data)
      .then((result) => (result.result ? this.handleClose() : result));
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
        >
          <DialogTitle>
            <T>Create a new exercise</T>
          </DialogTitle>
          <DialogContent>
            <ExerciseForm onSubmit={this.onSubmit.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={this.handleClose.bind(this)}>
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('exerciseForm')}
            >
              <T>Create</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateExercise.propTypes = {
  addExercise: PropTypes.func,
};

export default R.compose(
  connect(null, { addExercise }),
  withStyles(styles),
)(CreateExercise);
