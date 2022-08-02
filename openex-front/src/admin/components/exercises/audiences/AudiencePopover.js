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
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  updateAudience,
  deleteAudience,
  updateAudienceActivation,
} from '../../../../actions/Audience';
import inject18n from '../../../../components/i18n';
import AudienceForm from './AudienceForm';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import { Transition } from '../../../../utils/Environment';
import { storeHelper, tagsConverter } from '../../../../actions/Schema';

class AudiencePopover extends Component {
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
      R.assoc('audience_tags', R.pluck('id', data.audience_tags)),
    )(data);
    return this.props
      .updateAudience(
        this.props.exerciseId,
        this.props.audience.audience_id,
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
    this.props.deleteAudience(
      this.props.exerciseId,
      this.props.audience.audience_id,
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
    this.props.onRemoveAudience(this.props.audience.audience_id);
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
    this.props.updateAudienceActivation(
      this.props.exerciseId,
      this.props.audience.audience_id,
      { audience_enabled: true },
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
    this.props.updateAudienceActivation(
      this.props.exerciseId,
      this.props.audience.audience_id,
      { audience_enabled: false },
    );
    this.handleCloseDisable();
  }

  handleOpenEditPlayers() {
    this.props.setSelectedAudience(this.props.audience.audience_id);
    this.handlePopoverClose();
  }

  render() {
    const {
      t,
      audience,
      setSelectedAudience,
      exercise,
      onRemoveAudience,
      tagsMap,
      disabled,
    } = this.props;
    const audienceTags = tagsConverter(audience.audience_tags, tagsMap);
    const initialValues = R.pipe(
      R.assoc('audience_tags', audienceTags),
      R.pick(['audience_name', 'audience_description', 'audience_tags']),
    )(audience);
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
          {setSelectedAudience && (
            <MenuItem onClick={this.handleOpenEditPlayers.bind(this)}>
              {t('Manage players')}
            </MenuItem>
          )}
          {audience.audience_enabled ? (
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
          {onRemoveAudience && (
            <MenuItem
              onClick={this.handleOpenRemove.bind(this)}
              disabled={isExerciseReadOnly(exercise)}
            >
              {t('Remove from the inject')}
            </MenuItem>
          )}
          {!onRemoveAudience && (
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
              {t('Do you want to delete this audience?')}
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
          <DialogTitle>{t('Update the audience')}</DialogTitle>
          <DialogContent>
            <AudienceForm
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
              {t('Do you want to remove the audience from the inject?')}
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
              {t('Do you want to enable this audience?')}
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
              {t('Do you want to disable this audience?')}
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

AudiencePopover.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  audience: PropTypes.object,
  updateAudience: PropTypes.func,
  updateAudienceActivation: PropTypes.func,
  deleteAudience: PropTypes.func,
  setSelectedAudience: PropTypes.func,
  onRemoveAudience: PropTypes.func,
  disabled: PropTypes.bool,
};

const select = (state) => {
  const helper = storeHelper(state);
  const tagsMap = helper.getTagsMap();
  return { tagsMap };
};

export default R.compose(
  connect(select, {
    updateAudience,
    deleteAudience,
    updateAudienceActivation,
  }),
  inject18n,
)(AudiencePopover);
