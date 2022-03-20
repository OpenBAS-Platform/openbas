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
import { updateAudiencePlayers } from '../../../actions/Audience';
import { updatePlayer, deletePlayer } from '../../../actions/User';
import PlayerForm from './PlayerForm';
import inject18n from '../../../components/i18n';
import { storeHelper, tagsConverter } from '../../../actions/Schema';
import { isExerciseReadOnly } from '../../../utils/Exercise';

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
      openRemove: false,
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
      R.assoc(
        'user_organization',
        data.user_organization && data.user_organization.id
          ? data.user_organization.id
          : data.user_organization,
      ),
      R.assoc('user_tags', R.pluck('id', data.user_tags)),
    )(data);
    return this.props
      .updatePlayer(this.props.user.user_id, inputValues)
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
    this.props.deletePlayer(this.props.user.user_id);
    this.handleCloseDelete();
  }

  handleOpenRemove() {
    this.setState({ openRemove: true });
    this.handlePopoverClose();
  }

  handleCloseRemove() {
    this.setState({ openRemove: false });
  }

  submitRemove() {
    this.props.updateAudiencePlayers(
      this.props.exerciseId,
      this.props.audienceId,
      {
        audience_users: R.filter(
          (n) => n !== this.props.user.user_id,
          this.props.audienceUsersIds,
        ),
      },
    );
    this.handleCloseRemove();
  }

  render() {
    const {
      t,
      userAdmin,
      user,
      organizationsMap,
      audienceId,
      exercise,
      tagsMap,
    } = this.props;
    const userOrganizationValue = organizationsMap[user.user_organization];
    const userOrganization = userOrganizationValue
      ? {
        id: userOrganizationValue.organization_id,
        label: userOrganizationValue.organization_name,
      }
      : null;
    const userTags = tagsConverter(user.user_tags, tagsMap);
    const initialValues = R.pipe(
      R.assoc('user_organization', userOrganization),
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
    const canDelete = user.user_email !== 'admin@openex.io' && (userAdmin || !user.user_admin);
    const canUpdateEmail = user.user_email !== 'admin@openex.io' && (userAdmin || !user.user_admin);
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
          {audienceId && (
            <MenuItem
              onClick={this.handleOpenRemove.bind(this)}
              disabled={isExerciseReadOnly(exercise)}
            >
              {t('Remove from the audience')}
            </MenuItem>
          )}
          {canDelete && (
            <MenuItem onClick={this.handleOpenDelete.bind(this)}>
              {t('Delete')}
            </MenuItem>
          )}
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this player?')}
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
          <DialogTitle>{t('Update the player')}</DialogTitle>
          <DialogContent>
            <PlayerForm
              initialValues={initialValues}
              editing={true}
              organizations={R.values(organizationsMap)}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
              canUpdateEmail={canUpdateEmail}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.openRemove}
          TransitionComponent={Transition}
          onClose={this.handleCloseRemove.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to remove the player from the audience?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseRemove.bind(this)}>
              {t('Cancel')}
            </Button>
            <Button color="secondary" onClick={this.submitRemove.bind(this)}>
              {t('Remove')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

PlayerPopover.propTypes = {
  t: PropTypes.func,
  user: PropTypes.object,
  updatePlayer: PropTypes.func,
  deletePlayer: PropTypes.func,
  tags: PropTypes.object,
  userAdmin: PropTypes.bool,
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  audienceId: PropTypes.string,
  audienceUsersIds: PropTypes.array,
  tagsMap: PropTypes.object,
  organizationsMap: PropTypes.object,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { exerciseId } = ownProps;
  return {
    userAdmin: helper.getMe()?.user_admin,
    exercise: helper.getExercise(exerciseId),
  };
};

export default R.compose(
  connect(select, { updatePlayer, deletePlayer, updateAudiencePlayers }),
  inject18n,
)(PlayerPopover);
