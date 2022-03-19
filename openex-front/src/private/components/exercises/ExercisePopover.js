import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withRouter } from 'react-router-dom';
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
import withStyles from '@mui/styles/withStyles';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import inject18n from '../../../components/i18n';
import ExerciseForm from './ExerciseForm';
import { updateExercise, deleteExercise } from '../../../actions/Exercise';
import { Transition } from '../../../utils/Environment';
import { isExerciseReadOnly } from '../../../utils/Exercise';
import { tagsConverter } from '../../../actions/Schema';

const styles = () => ({
  button: {
    float: 'left',
    margin: '-10px 0 0 5px',
  },
  tableHeader: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  },
  tableCell: {
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  },
});

class ExercisePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openExport: false,
      openPopover: false,
      exportPlayers: false,
    };
  }

  handleToggleExportPlayers() {
    this.setState({ exportPlayers: !this.state.exportPlayers });
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
      R.assoc('exercise_tags', R.pluck('id', data.exercise_tags)),
    )(data);
    return this.props
      .updateExercise(this.props.exercise.exercise_id, inputValues)
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
    this.props.deleteExercise(this.props.exercise.exercise_id);
    this.handleCloseDelete();
    this.props.history.push('/exercises');
  }

  handleOpenExport() {
    this.setState({ openExport: true });
    this.handlePopoverClose();
  }

  handleCloseExport() {
    this.setState({ openExport: false });
  }

  submitExport() {
    const { exportPlayers } = this.state;
    const link = document.createElement('a');
    link.href = `/api/exercises/${this.props.exercise.exercise_id}/export?isWithPlayers=${exportPlayers}`;
    link.click();
    this.handleCloseExport();
  }

  render() {
    const {
      t, exercise, tagsMap, classes,
    } = this.props;
    const exerciseTags = tagsConverter(exercise.exercise_tags, tagsMap);
    const initialValues = R.pipe(
      R.assoc('exercise_tags', exerciseTags),
      R.pick([
        'exercise_name',
        'exercise_subtitle',
        'exercise_description',
        'exercise_mail_from',
        'exercise_message_header',
        'exercise_message_footer',
        'exercise_tags',
      ]),
    )(exercise);
    return (
      <div>
        <IconButton
          classes={{ root: classes.button }}
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
            disabled={isExerciseReadOnly(exercise, true)}
          >
            {t('Update')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenExport.bind(this)}>
            {t('Export')}
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={isExerciseReadOnly(exercise, true)}
          >
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
              {t('Do you want to delete this exercise?')}
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
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Update the exercise')}</DialogTitle>
          <DialogContent>
            <ExerciseForm
              initialValues={initialValues}
              editing={true}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.openExport}
          TransitionComponent={Transition}
          onClose={this.handleCloseExport.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Export the exercise')}</DialogTitle>
          <DialogContent>
            <Table selectable={false} size="small">
              <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                <TableRow>
                  <TableCell classes={{ root: classes.tableHeader }}>
                    {t('Elements')}
                  </TableCell>
                  <TableCell
                    classes={{ root: classes.tableHeader }}
                    style={{ textAlign: 'center' }}
                  >
                    {t('Export')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody displayRowCheckbox={false}>
                <TableRow>
                  <TableCell classes={{ root: classes.tableCell }}>
                    {t('Scenario (including attached files)')}
                  </TableCell>
                  <TableCell
                    classes={{ root: classes.tableCell }}
                    style={{ textAlign: 'center' }}
                  >
                    <Checkbox checked={true} disabled={true} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell classes={{ root: classes.tableCell }}>
                    {t('Audiences')}
                  </TableCell>
                  <TableCell
                    classes={{ root: classes.tableCell }}
                    style={{ textAlign: 'center' }}
                  >
                    <Checkbox checked={true} disabled={true} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell classes={{ root: classes.tableCell }}>
                    {t('Players')}
                  </TableCell>
                  <TableCell
                    classes={{ root: classes.tableCell }}
                    style={{ textAlign: 'center' }}
                  >
                    <Checkbox
                      checked={this.state.exportPlayers}
                      onChange={this.handleToggleExportPlayers.bind(this)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseExport.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitExport.bind(this)}
            >
              {t('Export')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ExercisePopover.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  exercise: PropTypes.object,
  tagsMap: PropTypes.object,
  updateExercise: PropTypes.func,
  deleteExercise: PropTypes.func,
  history: PropTypes.object,
};

export default R.compose(
  connect(null, { updateExercise, deleteExercise }),
  withStyles(styles),
  withRouter,
  inject18n,
)(ExercisePopover);
