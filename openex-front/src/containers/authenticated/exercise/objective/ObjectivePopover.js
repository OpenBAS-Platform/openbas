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
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import {
  fetchObjective,
  updateObjective,
  deleteObjective,
} from '../../../../actions/Objective';
import ObjectiveForm from './ObjectiveForm';
import { submitForm } from '../../../../utils/Action';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

i18nRegister({
  fr: {
    'Update the objective': "Modifier l'objectif",
    'Do you want to delete this objective?':
      'Souhaitez-vous supprimer cet objectif ?',
  },
});

class ObjectivePopover extends Component {
  constructor(props) {
    super(props);
    this.state = { openDelete: false, openEdit: false, anchorEl: null };
  }

  handlePopoverOpen(event) {
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
    return this.props
      .updateObjective(
        this.props.exerciseId,
        this.props.objective.objective_id,
        data,
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
    this.props.deleteObjective(this.props.exerciseId, this.props.objective.objective_id);
    this.handleCloseDelete();
  }

  render() {
    const objectiveIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.objective,
    );
    const objectiveIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.objective,
    );
    const initialValues = R.pick(
      ['objective_title', 'objective_description', 'objective_priority'],
      this.props.objective,
    );
    return (
      <div>
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
          <MenuItem
            onClick={this.handleOpenEdit.bind(this)}
            disabled={!objectiveIsUpdatable}
          >
            <T>Edit</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={!objectiveIsDeletable}
          >
            <T>Delete</T>
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to delete this objective?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDelete.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDelete.bind(this)}
            >
              <T>Delete</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openEdit}
          TransitionComponent={Transition}
          onClose={this.handleCloseEdit.bind(this)}
        >
          <DialogTitle>
            <T>Update the objective</T>
          </DialogTitle>
          <DialogContent>
            <ObjectiveForm
              initialValues={initialValues}
              onSubmit={this.onSubmitEdit.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEdit.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              onClick={() => submitForm('objectiveForm')}
            >
              <T>Update</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ObjectivePopover.propTypes = {
  exerciseId: PropTypes.string,
  fetchObjective: PropTypes.func,
  updateObjective: PropTypes.func,
  deleteObjective: PropTypes.func,
  objective: PropTypes.object,
  children: PropTypes.node,
};

export default connect(null, {
  fetchObjective,
  updateObjective,
  deleteObjective,
})(ObjectivePopover);
