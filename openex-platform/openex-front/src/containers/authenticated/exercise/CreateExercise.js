import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import { T } from '../../../components/I18n';
import { i18nRegister } from '../../../utils/Messages';
import ExerciseForm from './ExerciseForm';
/* eslint-disable */
import { addExercise } from "../../../actions/Exercise";
/* eslint-enable */

i18nRegister({
  fr: {
    'Create a new exercise': 'Créer un nouvel exercice',
  },
});

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

  submitForm() {
    // eslint-disable-next-line react/no-string-refs
    this.refs.exerciseForm.submit();
  }

  onSubmit(data) {
    console.log(data);
    return this.props.addExercise(data);
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
        <Dialog open={this.state.open} onClose={this.handleClose.bind(this)}>
          <DialogTitle>
            <T>Create a new exercise</T>
          </DialogTitle>
          <DialogContent>
            {/* eslint-disable */}
            <ExerciseForm
              ref="exerciseForm"
              onSubmit={this.onSubmit.bind(this)}
            />
            {/* eslint-enable */}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.handleClose.bind(this)}>
              <T>Cancel</T>
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.submitForm.bind(this)}
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
