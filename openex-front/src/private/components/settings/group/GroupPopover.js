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
import { updateGroup, deleteGroup } from '../../../../actions/Group';
import GroupForm from './GroupForm';
import inject18n from '../../../../components/i18n';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class GroupPopover extends Component {
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
    return this.props
      .updateGroup(this.props.group.group_id, data)
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
    this.props.deleteGroup(this.props.group.group_id);
    this.handleCloseDelete();
  }

  render() {
    const { t } = this.props;
    const initialValues = R.pipe(R.pick(['group_name', 'group_description']))(
      this.props.group,
    );
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
              {t('Do you want to delete this group?')}
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
        >
          <DialogTitle>{t('Update the player')}</DialogTitle>
          <DialogContent>
            <GroupForm
              initialValues={initialValues}
              editing={true}
              onSubmit={this.onSubmitEdit.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseEdit.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="playerForm"
            >
              {t('Update')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const select = (state) => ({
  users: R.values(state.referential.entities.users),
});

GroupPopover.propTypes = {
  t: PropTypes.func,
  group: PropTypes.object,
  updateGroup: PropTypes.func,
  deleteGroup: PropTypes.func,
  users: PropTypes.array,
};

export default R.compose(
  connect(select, { updateGroup, deleteGroup }),
  inject18n,
)(GroupPopover);
