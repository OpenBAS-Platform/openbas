import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { MoreVert } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
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
    'Create a new subobjective': 'Créer un nouveau sous-objectif',
    'Add a subobjective': 'Ajouter un sous-objectif',
    'Do you want to delete this objective?':
      'Souhaitez-vous supprimer cet objectif ?',
  },
});

class ObjectivePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openCreateSubobjective: false,
      anchorEl: null,
    };
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
    this.props.deleteObjective(
      this.props.exerciseId,
      this.props.objective.objective_id,
    );
    this.handleCloseDelete();
  }

  handleOpenCreateSubobjective() {
    this.setState({ openCreateSubobjective: true });
    this.handlePopoverClose();
  }

  handleCloseCreateSubobjective() {
    this.setState({ openCreateSubobjective: false });
  }

  onSubmitCreateSubobjective(data) {
    return this.props
      .addSubobjective(
        this.props.exerciseId,
        this.props.objective.objective_id,
        data,
      )
      .then(() => {
        this.props.fetchObjective(
          this.props.exerciseId,
          this.props.objective.objective_id,
        );
      })
      .then(() => this.handleCloseCreateSubobjective());
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
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenCreateSubobjective.bind(this)}>
            <T>Add a subobjective</T>
          </MenuItem>
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
