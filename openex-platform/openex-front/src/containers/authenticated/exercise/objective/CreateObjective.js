import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import { withStyles } from '@material-ui/core/styles';
import { Add } from '@material-ui/icons';
import Slide from '@material-ui/core/Slide';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import { addObjective } from '../../../../actions/Objective';
import ObjectiveForm from './ObjectiveForm';
import { submitForm } from '../../../../utils/Action';

i18nRegister({
  fr: {
    'Create a new objective': 'Créer un nouvel objectif',
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

class CreateObjective extends Component {
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
      .addObjective(this.props.exerciseId, data)
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
            <T>Create a new objective</T>
          </DialogTitle>
          <DialogContent>
            <ObjectiveForm onSubmit={this.onSubmit.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={this.handleClose.bind(this)}>
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('objectiveForm')}
            >
              <T>Create</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateObjective.propTypes = {
  exerciseId: PropTypes.string,
  addObjective: PropTypes.func,
};

export default R.compose(
  connect(null, { addObjective }),
  withStyles(styles),
)(CreateObjective);
