import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import withStyles from '@mui/styles/withStyles';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { updateExercise } from '../../../../actions/Exercise';
import { addDryrun } from '../../../../actions/Dryrun';
import { redirectToDryrun } from '../../../../actions/Application';
import DryrunForm from '../check/dryrun/DryrunForm';
import { submitForm } from '../../../../utils/Action';

const styles = () => ({
  container: {
    float: 'left',
    marginTop: -8,
  },
});

i18nRegister({
  fr: {
    'Do you want to disable this exercise?':
      'Souhaitez-vous désactiver cet exercice ?',
    'Do you want to enable this exercise?':
      'Souhaitez-vous activer cet exercice ?',
    Disable: 'Désactiver',
    Enable: 'Activer',
    'Launch a dryrun': 'Lancer une simulation',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class ExercisePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDisable: false,
      openEnable: false,
      openDryrun: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDisable() {
    this.setState({ openDisable: true });
    this.handlePopoverClose();
  }

  handleCloseDisable() {
    this.setState({ openDisable: false });
  }

  submitDisable() {
    const data = { exercise_canceled: true };
    this.props.updateExercise(this.props.exerciseId, 'activation', data);
    this.handleCloseDisable();
  }

  handleOpenEnable() {
    this.setState({ openEnable: true });
    this.handlePopoverClose();
  }

  handleCloseEnable() {
    this.setState({ openEnable: false });
  }

  submitEnable() {
    const data = { exercise_canceled: false };
    this.props.updateExercise(this.props.exerciseId, 'activation', data);
    this.handleCloseEnable();
  }

  handleOpenDryrun() {
    this.setState({ openDryrun: true });
    this.handlePopoverClose();
  }

  handleCloseDryrun() {
    this.setState({ openDryrun: false });
  }

  onSubmitDryrun(data) {
    return this.props.addDryrun(this.props.exerciseId, data).then((payload) => {
      this.props.redirectToDryrun(this.props.exerciseId, payload.result);
    });
  }

  render() {
    const { classes } = this.props;
    const exerciseDisabled = R.propOr(
      false,
      'exercise_canceled',
      this.props.exercise,
    );
    const exerciseIsUpdatable = R.propOr(
      false,
      'user_can_update',
      this.props.exercise,
    );
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large">
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenDryrun.bind(this)}>
            <T>Launch a dryrun</T>
          </MenuItem>
          {exerciseDisabled ? (
            <MenuItem
              onClick={this.handleOpenEnable.bind(this)}
              disabled={!exerciseIsUpdatable}
            >
              <T>Enable</T>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={this.handleOpenDisable.bind(this)}
              disabled={!exerciseIsUpdatable}
            >
              <T>Disable</T>
            </MenuItem>
          )}
        </Menu>
        <Dialog
          open={this.state.openDisable}
          onClose={this.handleCloseDisable.bind(this)}
          TransitionComponent={Transition}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to disable this exercise?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDisable.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDisable.bind(this)}
            >
              <T>Disable</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEnable}
          onClose={this.handleCloseEnable.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to enable this exercise?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEnable.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitEnable.bind(this)}
            >
              <T>Enable</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openDryrun}
          TransitionComponent={Transition}
          onClose={this.handleCloseDryrun.bind(this)}
        >
          <DialogTitle>
            <T>Launch a dryrun</T>
          </DialogTitle>
          <DialogContent>
            <DryrunForm onSubmit={this.onSubmitDryrun.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDryrun.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('dryrunForm')}
            >
              <T>Launch</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ExercisePopover.propTypes = {
  exerciseId: PropTypes.string,
  updateExercise: PropTypes.func,
  exercise: PropTypes.object,
  addDryrun: PropTypes.func,
  redirectToDryrun: PropTypes.func,
};

export default R.compose(
  connect(null, { updateExercise, addDryrun, redirectToDryrun }),
  withStyles(styles),
)(ExercisePopover);
