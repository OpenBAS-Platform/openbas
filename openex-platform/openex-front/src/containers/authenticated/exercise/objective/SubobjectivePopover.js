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
import { fetchObjective } from '../../../../actions/Objective';
import {
  updateSubobjective,
  deleteSubobjective,
} from '../../../../actions/Subobjective';
import SubobjectiveForm from './SubobjectiveForm';
import { submitForm } from '../../../../utils/Action';

i18nRegister({
  fr: {
    'Update the subobjective': 'Modifier le sous-objectif',
    'Do you want to delete this subobjective?':
      'Souhaitez-vous supprimer ce sous-objectif ?',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class SubobjectivePopover extends Component {
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
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenEdit() {
    this.setState({
      openEdit: true,
    });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({
      openEdit: false,
    });
  }

  onSubmitEdit(data) {
    return this.props
      .updateSubobjective(
        this.props.exerciseId,
        this.props.objectiveId,
        this.props.subobjective.subobjective_id,
        data,
      )
      .then(() => this.handleCloseEdit());
  }

  handleOpenDelete() {
    this.setState({
      openDelete: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({
      openDelete: false,
    });
  }

  submitDelete() {
    this.props
      .deleteSubobjective(
        this.props.exerciseId,
        this.props.objectiveId,
        this.props.subobjective.subobjective_id,
      )
      .then(() => {
        this.props.fetchObjective(
          this.props.exerciseId,
          this.props.objectiveId,
        );
      });
    this.handleCloseDelete();
  }

  render() {
    const subobjectiveIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.subobjective,
    );
    const subobjectiveIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.subobjective,
    );
    const initialValues = R.pick(
      [
        'subobjective_title',
        'subobjective_description',
        'subobjective_priority',
      ],
      this.props.subobjective,
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
          <MenuItem
            onClick={this.handleOpenEdit.bind(this)}
            disabled={!subobjectiveIsUpdatable}
          >
            <T>Edit</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={!subobjectiveIsDeletable}
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
              <T>Do you want to delete this subobjective?</T>
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
            <T>Update the subobjective</T>
          </DialogTitle>
          <DialogContent>
            <SubobjectiveForm
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
              color="secondary"
              onClick={() => submitForm('subobjectiveForm')}
            >
              <T>Update</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

SubobjectivePopover.propTypes = {
  exerciseId: PropTypes.string,
  objectiveId: PropTypes.string,
  fetchObjective: PropTypes.func,
  deleteSubobjective: PropTypes.func,
  updateSubobjective: PropTypes.func,
  subobjective: PropTypes.object,
  children: PropTypes.node,
};

export default connect(null, {
  fetchObjective,
  updateSubobjective,
  deleteSubobjective,
})(SubobjectivePopover);
