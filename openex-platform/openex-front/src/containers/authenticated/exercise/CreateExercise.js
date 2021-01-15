import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { Add } from '@material-ui/icons';
import Slide from '@material-ui/core/Slide';
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
    return this.props.addExercise(data).then(() => this.handleClose());
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
            <Button variant="contained" onClick={this.handleClose.bind(this)}>
              <T>Cancel</T>
            </Button>
            <Button
              variant="contained"
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
