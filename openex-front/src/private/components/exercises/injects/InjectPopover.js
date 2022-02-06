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
import Slide from '@mui/material/Slide';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import {
  updateInject,
  deleteInject,
  tryInject,
  updateInjectActivation,
  injectDone,
} from '../../../../actions/Inject';
import InjectForm from './InjectForm';
import inject18n from '../../../../components/i18n';
import { splitDuration } from '../../../../utils/Time';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import { storeBrowser } from '../../../../actions/Schema';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class InjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      openTry: false,
      openCopy: false,
      openEnable: false,
      openDisable: false,
      openDone: false,
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
      R.assoc(
        'inject_depends_duration',
        data.inject_depends_duration_days * 3600 * 24
          + data.inject_depends_duration_hours * 3600
          + data.inject_depends_duration_minutes * 60,
      ),
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
      R.dissoc('inject_depends_duration_days'),
      R.dissoc('inject_depends_duration_hours'),
      R.dissoc('inject_depends_duration_minutes'),
    )(data);
    return this.props
      .updateInject(
        this.props.exerciseId,
        this.props.inject.inject_id,
        inputValues,
      )
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
    this.props.deleteInject(this.props.exerciseId, this.props.inject.inject_id);
    this.handleCloseDelete();
  }

  handleOpenTry() {
    this.setState({
      openTry: true,
    });
    this.handlePopoverClose();
  }

  handleCloseTry() {
    this.setState({
      openTry: false,
    });
  }

  submitTry() {
    this.props.tryInject(this.props.inject.inject_id).then((payload) => {
      this.setState({ injectResult: payload, openResult: true });
    });
    this.handleCloseTry();
  }

  handleOpenEnable() {
    this.setState({
      openEnable: true,
    });
    this.handlePopoverClose();
  }

  handleCloseEnable() {
    this.setState({
      openEnable: false,
    });
  }

  submitEnable() {
    this.props.updateInjectActivation(
      this.props.exerciseId,
      this.props.inject.inject_id,
      { inject_enabled: true },
    );
    this.handleCloseEnable();
  }

  handleOpenDisable() {
    this.setState({
      openDisable: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDisable() {
    this.setState({
      openDisable: false,
    });
  }

  submitDisable() {
    this.props.updateInjectActivation(
      this.props.exerciseId,
      this.props.inject.inject_id,
      { inject_enabled: false },
    );
    this.handleCloseDisable();
  }

  handleOpenDone() {
    this.setState({
      openDone: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDone() {
    this.setState({
      openDone: false,
    });
  }

  submitDone() {
    this.props.injectDone(this.props.inject.inject_id);
    this.handleCloseDone();
  }

  handleOpenEditContent() {
    this.props.setSelectedInject(this.props.inject.inject_id);
    this.handlePopoverClose();
  }

  render() {
    const {
      t, inject, injectTypes, exercise, setSelectedInject,
    } = this.props;
    const injectTags = inject.tags.map((tag) => ({
      id: tag.tag_id,
      label: tag.tag_name,
      color: tag.tag_color,
    }));
    const duration = splitDuration(inject.inject_depends_duration || 0);
    const initialValues = R.pipe(
      R.assoc('inject_tags', injectTags),
      R.pick([
        'inject_title',
        'inject_type',
        'inject_description',
        'inject_tags',
        'inject_content',
        'inject_audiences',
        'inject_all_audiences',
        'inject_country',
        'inject_city',
      ]),
      R.assoc('inject_depends_duration_days', duration.days),
      R.assoc('inject_depends_duration_hours', duration.hours),
      R.assoc('inject_depends_duration_minutes', duration.minutes),
    )(inject);
    return (
      <div>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
        >
          <MenuItem
            onClick={this.handleOpenEdit.bind(this)}
            disabled={isExerciseReadOnly(exercise)}
          >
            {t('Update')}
          </MenuItem>
          {setSelectedInject && (
            <MenuItem onClick={this.handleOpenEditContent.bind(this)}>
              {t('Manage content')}
            </MenuItem>
          )}
          {!inject.inject_status && (
            <MenuItem
              onClick={this.handleOpenDone.bind(this)}
              disabled={isExerciseReadOnly(exercise)}
            >
              {t('Mark as done')}
            </MenuItem>
          )}
          {inject.inject_type !== 'openex_manual' && (
            <MenuItem onClick={this.handleOpenTry.bind(this)}>
              {t('Try the inject')}
            </MenuItem>
          )}
          {inject.inject_enabled ? (
            <MenuItem
              onClick={this.handleOpenDisable.bind(this)}
              disabled={isExerciseReadOnly(exercise)}
            >
              {t('Disable')}
            </MenuItem>
          ) : (
            <MenuItem
              onClick={this.handleOpenEnable.bind(this)}
              disabled={isExerciseReadOnly(exercise)}
            >
              {t('Enable')}
            </MenuItem>
          )}
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={isExerciseReadOnly(exercise)}
          >
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
              {t('Do you want to delete this inject?')}
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
          <DialogTitle>{t('Update the inject')}</DialogTitle>
          <DialogContent>
            <InjectForm
              initialValues={initialValues}
              editing={true}
              injectTypes={injectTypes}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openTry}
          onClose={this.handleCloseTry.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <p>{t('Do you want to try this inject?')}</p>
              <Alert severity="info">
                {t('The inject will only be sent to you.')}
              </Alert>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseTry.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitTry.bind(this)}
            >
              {t('Try')}
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
              {t('Do you want to enable this inject?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseEnable.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitEnable.bind(this)}
            >
              {t('Enable')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openDisable}
          onClose={this.handleCloseDisable.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to disable this inject?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseDisable.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitDisable.bind(this)}
            >
              {t('Disable')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openDone}
          onClose={this.handleCloseDone.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to mark this inject as done?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseDone.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitDone.bind(this)}
            >
              {t('Mark')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

InjectPopover.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  inject: PropTypes.object,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  injectTypes: PropTypes.array,
  updateInjectActivation: PropTypes.func,
  injectDone: PropTypes.func,
  setSelectedInject: PropTypes.func,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { exerciseId } = ownProps;
  return {
    exercise: browser.getExercise(exerciseId),
  };
};

export default R.compose(
  connect(select, {
    updateInject,
    deleteInject,
    tryInject,
    updateInjectActivation,
    injectDone,
  }),
  inject18n,
)(InjectPopover);
