import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withRouter } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import { EditOutlined } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import { updateExerciseStartDate } from '../../../actions/Exercise';
import inject18n from '../../../components/i18n';
import ExerciseDateForm from './ExerciseDateForm';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  button: {
    float: 'left',
    margin: '-15px 0 0 0',
  },
});

class ExerciseDatePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openEdit: false,
    };
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    return this.props
      .updateExerciseStartDate(this.props.exercise.exercise_id, data)
      .then(() => this.handleCloseEdit());
  }

  render() {
    const { t, exercise, classes } = this.props;
    const initialValues = R.pipe(R.pick(['exercise_start_date']))(exercise);
    return (
      <div>
        <IconButton
          classes={{ root: classes.button }}
          onClick={this.handleOpenEdit.bind(this)}
          aria-haspopup="true"
          size="large"
        >
          <EditOutlined color="secondary" fontSize="small" />
        </IconButton>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Update the exercise')}</DialogTitle>
          <DialogContent>
            <ExerciseDateForm
              initialValues={initialValues}
              editing={true}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

ExerciseDatePopover.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  exercise: PropTypes.object,
  updateExerciseStartDate: PropTypes.func,
  history: PropTypes.object,
};

export default R.compose(
  connect(null, { updateExerciseStartDate }),
  withStyles(styles),
  withRouter,
  inject18n,
)(ExerciseDatePopover);
