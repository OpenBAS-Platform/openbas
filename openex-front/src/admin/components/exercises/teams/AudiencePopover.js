import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { updateTeam, deleteTeam, updateTeamActivation } from '../../../../actions/Team';
import inject18n from '../../../../components/i18n';
import TeamForm from './TeamForm';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import { Transition } from '../../../../utils/Environment';
import { storeHelper } from '../../../../actions/Schema';
import { tagOptions } from '../../../../utils/Option';

class TeamPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openRemove: false,
      openEnable: false,
      openDisable: false,
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
      R.assoc('team_tags', R.pluck('id', data.team_tags)),
    )(data);
    return this.props
      .updateTeam(
        this.props.exerciseId,
        this.props.team.team_id,
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
    this.props.deleteTeam(
      this.props.exerciseId,
      this.props.team.team_id,
    );
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
    this.props.onRemoveTeam(this.props.team.team_id);
    this.handleCloseRemove();
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
    this.props.updateTeamActivation(
      this.props.exerciseId,
      this.props.team.team_id,
      { team_enabled: true },
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
    this.props.updateTeamActivation(
      this.props.exerciseId,
      this.props.team.team_id,
      { team_enabled: false },
    );
    this.handleCloseDisable();
  }

  handleOpenEditPlayers() {
    this.props.setSelectedTeam(this.props.team.team_id);
    this.handlePopoverClose();
  }

  render() {
    const {
      t,
      team,
      setSelectedTeam,
      exercise,
      onRemoveTeam,
      tagsMap,
      disabled,
    } = this.props;
    const teamTags = tagOptions(team.team_tags, tagsMap);
    const initialValues = R.pipe(
      R.assoc('team_tags', teamTags),
      R.pick(['team_name', 'team_description', 'team_tags']),
    )(team);
    return (
      <div>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large"
          disabled={disabled}
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
          {setSelectedTeam && (
            <MenuItem onClick={this.handleOpenEditPlayers.bind(this)}>
              {t('Manage players')}
            </MenuItem>
          )}
          {team.team_enabled ? (
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
          {onRemoveTeam && (
            <MenuItem
              onClick={this.handleOpenRemove.bind(this)}
              disabled={isExerciseReadOnly(exercise)}
            >
              {t('Remove from the inject')}
            </MenuItem>
          )}
          {!onRemoveTeam && (
            <MenuItem
              onClick={this.handleOpenDelete.bind(this)}
              disabled={isExerciseReadOnly(exercise)}
            >
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
              {t('Do you want to delete this team?')}
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
          <DialogTitle>{t('Update the team')}</DialogTitle>
          <DialogContent>
            <TeamForm
              initialValues={initialValues}
              editing={true}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
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
              {t('Do you want to remove the team from the inject?')}
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
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEnable}
          onClose={this.handleCloseEnable.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to enable this team?')}
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
              {t('Do you want to disable this team?')}
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
      </div>
    );
  }
}

TeamPopover.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  team: PropTypes.object,
  updateTeam: PropTypes.func,
  updateTeamActivation: PropTypes.func,
  deleteTeam: PropTypes.func,
  setSelectedTeam: PropTypes.func,
  onRemoveTeam: PropTypes.func,
  disabled: PropTypes.bool,
};

const select = (state) => {
  const helper = storeHelper(state);
  const tagsMap = helper.getTagsMap();
  return { tagsMap };
};

export default R.compose(
  connect(select, {
    updateTeam,
    deleteTeam,
    updateTeamActivation,
  }),
  inject18n,
)(TeamPopover);
