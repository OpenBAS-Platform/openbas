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
import { updateUser, deleteUser } from '../../../actions/User';
import PlayerForm from './PlayerForm';
import inject18n from '../../../components/i18n';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class PlayerPopover extends Component {
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
      R.assoc('user_tags', R.pluck('id', data.user_tags)),
    )(data);
    return this.props
      .updateUser(this.props.user.user_id, inputValues)
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
    this.props.deleteUser(this.props.user.user_id);
    this.handleCloseDelete();
  }

  render() {
    const {
      t, userAdmin, user, tags, organizations,
    } = this.props;
    const organizationPath = [
      R.prop('user_organization', this.props.user),
      'organization_name',
    ];
    const organizationName = R.pathOr('-', organizationPath, organizations);
    const userTags = R.map((n) => {
      const tag = R.propOr({}, n, tags);
      return { id: tag.tag_id, label: tag.tag_name, color: tag.tag_color };
    }, user.user_tags);
    const initialValues = R.pipe(
      R.assoc('user_organization', organizationName),
      R.assoc('user_tags', userTags),
      R.pick([
        'user_firstname',
        'user_lastname',
        'user_email',
        'user_organization',
        'user_phone',
        'user_phone2',
        'user_pgp_key',
        'user_tags',
      ]),
    )(user);
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
          {userAdmin && (
            <MenuItem onClick={this.handleOpenDelete.bind(this)}>
              {t('Delete')}
            </MenuItem>
          )}
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this player?')}
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
            <PlayerForm
              initialValues={initialValues}
              editing={true}
              organizations={organizations}
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

const select = (state) => {
  const userId = R.path(['logged', 'user'], state.app);
  const { tags, organizations } = state.referential.entities;
  return {
    tags,
    organizations,
    userAdmin: R.path([userId, 'user_admin'], state.referential.entities.users),
  };
};

PlayerPopover.propTypes = {
  t: PropTypes.func,
  user: PropTypes.object,
  updateUser: PropTypes.func,
  deleteUser: PropTypes.func,
  organizations: PropTypes.object,
  tags: PropTypes.object,
  userAdmin: PropTypes.bool,
};

export default R.compose(
  connect(select, { updateUser, deleteUser }),
  inject18n,
)(PlayerPopover);
