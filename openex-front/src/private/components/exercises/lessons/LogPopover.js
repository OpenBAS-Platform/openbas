import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { updateLog, deleteLog } from '../../../../actions/Log';
import LogForm from './LogForm';
import inject18n from '../../../../components/i18n';
import { Transition } from '../../../../utils/Environment';
import { storeBrowser } from '../../../../actions/Schema';
import { isExerciseReadOnly } from '../../../../utils/Exercise';

class LogPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    const inputValues = R.pipe(
      R.assoc('log_tags', R.pluck('id', data.log_tags)),
    )(data);
    return this.props
      .updateLog(this.props.exerciseId, this.props.log.log_id, inputValues)
      .then(() => this.handleCloseEdit());
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props.deleteLog(this.props.exerciseId, this.props.log.log_id);
    this.handleCloseDelete();
  }

  render() {
    const { t, log, exercise } = this.props;
    const logTags = log.tags.map((tag) => ({
      id: tag.tag_id,
      label: tag.tag_name,
      color: tag.tag_color,
    }));
    const initialValues = R.pipe(
      R.assoc('log_tags', logTags),
      R.pick(['log_title', 'log_content', 'log_tags']),
    )(log);
    return (
      <div>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large"
          disabled={isExerciseReadOnly(exercise, true)}
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
        >
          <MenuItem onClick={this.handleOpenEdit.bind(this)}>
            {t('Update')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>
            {t('Delete')}
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this log?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseDelete.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitDelete.bind(this)}
            >
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Update the log')}</DialogTitle>
          <DialogContent>
            <LogForm
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

LogPopover.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  log: PropTypes.object,
  updateLog: PropTypes.func,
  deleteLog: PropTypes.func,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { exerciseId } = ownProps;
  return {
    exercise: browser.getExercise(exerciseId),
  };
};

export default R.compose(
  connect(select, { updateLog, deleteLog }),
  inject18n,
)(LogPopover);
