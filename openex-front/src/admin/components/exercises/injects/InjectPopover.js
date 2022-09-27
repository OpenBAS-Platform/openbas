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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import withStyles from '@mui/styles/withStyles';
import {
  updateInject,
  deleteInject,
  tryInject,
  updateInjectActivation,
  injectDone,
  updateInjectTrigger,
} from '../../../../actions/Inject';
import InjectForm from './InjectForm';
import inject18n from '../../../../components/i18n';
import { splitDuration } from '../../../../utils/Time';
import {
  isExerciseReadOnly,
  secondsFromToNow,
} from '../../../../utils/Exercise';
import { tagsConverter } from '../../../../actions/Schema';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  tableHeader: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  },
  tableCell: {
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  },
});

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
      openResult: false,
      openTrigger: false,
      injectResult: null,
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
      R.assoc('inject_contract', data.inject_contract.id),
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

  handleCloseResult() {
    this.setState({
      openResult: false,
      injectResult: null,
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
    this.props.injectDone(
      this.props.exercise.exercise_id,
      this.props.inject.inject_id,
    );
    this.handleCloseDone();
  }

  handleOpenEditContent() {
    this.props.setSelectedInject(this.props.inject.inject_id);
    this.handlePopoverClose();
  }

  handleOpenTrigger() {
    this.setState({
      openTrigger: true,
    });
    this.handlePopoverClose();
  }

  handleCloseTrigger() {
    this.setState({
      openTrigger: false,
    });
  }

  submitTrigger() {
    this.props.updateInjectTrigger(
      this.props.exerciseId,
      this.props.inject.inject_id,
      {
        inject_depends_duration: secondsFromToNow(
          this.props.exercise.exercise_start_date,
        ),
      },
    );
    this.handleCloseTrigger();
  }

  render() {
    const {
      t,
      inject,
      injectTypesMap,
      exercise,
      setSelectedInject,
      tagsMap,
      isDisabled,
      classes,
    } = this.props;
    const injectTags = tagsConverter(inject.inject_tags, tagsMap);
    const duration = splitDuration(inject.inject_depends_duration || 0);
    const initialValues = R.pipe(
      R.assoc('inject_tags', injectTags),
      R.pick([
        'inject_title',
        'inject_contract',
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
          disabled={isExerciseReadOnly(exercise)}
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
            disabled={isDisabled}
          >
            {t('Update')}
          </MenuItem>
          {setSelectedInject && (
            <MenuItem
              onClick={this.handleOpenEditContent.bind(this)}
              disabled={isDisabled}
            >
              {t('Manage content')}
            </MenuItem>
          )}
          {!inject.inject_status && (
            <MenuItem
              onClick={this.handleOpenDone.bind(this)}
              disabled={isDisabled}
            >
              {t('Mark as done')}
            </MenuItem>
          )}
          {inject.inject_type !== 'openex_manual' && (
            <MenuItem
              onClick={this.handleOpenTrigger.bind(this)}
              disabled={isDisabled || exercise.exercise_status !== 'RUNNING'}
            >
              {t('Trigger now')}
            </MenuItem>
          )}
          {inject.inject_type !== 'openex_manual' && (
            <MenuItem
              onClick={this.handleOpenTry.bind(this)}
              disabled={isDisabled}
            >
              {t('Try the inject')}
            </MenuItem>
          )}
          {inject.inject_enabled ? (
            <MenuItem
              onClick={this.handleOpenDisable.bind(this)}
              disabled={isDisabled}
            >
              {t('Disable')}
            </MenuItem>
          ) : (
            <MenuItem
              onClick={this.handleOpenEnable.bind(this)}
              disabled={isDisabled}
            >
              {t('Enable')}
            </MenuItem>
          )}
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>
            {t('Delete')}
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this inject?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDelete.bind(this)}>
              {t('Cancel')}
            </Button>
            <Button color="secondary" onClick={this.submitDelete.bind(this)}>
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
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Update the inject')}</DialogTitle>
          <DialogContent>
            <InjectForm
              initialValues={initialValues}
              editing={true}
              injectTypesMap={injectTypesMap}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openTry}
          onClose={this.handleCloseTry.bind(this)}
          PaperProps={{ elevation: 1 }}
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
            <Button onClick={this.handleCloseTry.bind(this)}>
              {t('Cancel')}
            </Button>
            <Button color="secondary" onClick={this.submitTry.bind(this)}>
              {t('Try')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEnable}
          onClose={this.handleCloseEnable.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to enable this inject?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseEnable.bind(this)}>
              {t('Cancel')}
            </Button>
            <Button color="secondary" onClick={this.submitEnable.bind(this)}>
              {t('Enable')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openDisable}
          onClose={this.handleCloseDisable.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to disable this inject?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDisable.bind(this)}>
              {t('Cancel')}
            </Button>
            <Button color="secondary" onClick={this.submitDisable.bind(this)}>
              {t('Disable')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openDone}
          onClose={this.handleCloseDone.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to mark this inject as done?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDone.bind(this)}>
              {t('Cancel')}
            </Button>
            <Button color="secondary" onClick={this.submitDone.bind(this)}>
              {t('Mark')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openTrigger}
          onClose={this.handleCloseTrigger.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to trigger this inject now?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseTrigger.bind(this)}>
              {t('Cancel')}
            </Button>
            <Button color="secondary" onClick={this.submitTrigger.bind(this)}>
              {t('Trigger')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openResult}
          TransitionComponent={Transition}
          onClose={this.handleCloseResult.bind(this)}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <Table selectable={false} size="small">
              <TableBody displayRowCheckbox={false}>
                {this.state.injectResult
                  && Object.entries(this.state.injectResult.status_reporting).map(
                    ([key, value]) => {
                      if (key === 'execution_traces') {
                        return (
                          <TableRow key={key}>
                            <TableCell classes={{ root: classes.tableCell }}>
                              {key}
                            </TableCell>
                            <TableCell classes={{ root: classes.tableCell }}>
                              <Table selectable={false} size="small" key={key}>
                                <TableBody displayRowCheckbox={false}>
                                  {value.map((trace) => (
                                    <TableRow key={trace.trace_identifier}>
                                      <TableCell
                                        classes={{ root: classes.tableCell }}
                                      >
                                        {trace.trace_message}
                                      </TableCell>
                                      <TableCell
                                        classes={{ root: classes.tableCell }}
                                      >
                                        {trace.trace_status}
                                      </TableCell>
                                      <TableCell
                                        classes={{ root: classes.tableCell }}
                                      >
                                        {trace.trace_time}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow key={key}>
                          <TableCell classes={{ root: classes.tableCell }}>
                            {key}
                          </TableCell>
                          <TableCell classes={{ root: classes.tableCell }}>
                            {value}
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseResult.bind(this)}>
              {t('Close')}
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
  tagsMap: PropTypes.object,
  inject: PropTypes.object,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  injectTypesMap: PropTypes.object,
  updateInjectActivation: PropTypes.func,
  updateInjectTrigger: PropTypes.func,
  injectDone: PropTypes.func,
  setSelectedInject: PropTypes.func,
  isDisabled: PropTypes.bool,
};

export default R.compose(
  connect(null, {
    updateInject,
    deleteInject,
    tryInject,
    updateInjectActivation,
    updateInjectTrigger,
    injectDone,
  }),
  inject18n,
  withStyles(styles),
)(InjectPopover);
