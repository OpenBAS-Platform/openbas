import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { updateDocument, deleteDocument } from '../../../../actions/Document';
import DocumentForm from './DocumentForm';
import inject18n from '../../../../components/i18n';
import { storeHelper } from '../../../../actions/Schema';
import Transition from '../../../../components/common/Transition';
import { exerciseOptions, scenarioOptions, tagOptions } from '../../../../utils/Option';

class DocumentPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      openRemove: false,
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
      R.assoc('document_tags', R.pluck('id', data.document_tags)),
      R.assoc('document_exercises', R.pluck('id', data.document_exercises)),
      R.assoc('document_scenarios', R.pluck('id', data.document_scenarios)),
    )(data);
    return this.props
      .updateDocument(this.props.document.document_id, inputValues)
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
    this.props.deleteDocument(this.props.document.document_id);
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
    this.props.onRemoveDocument(this.props.document.document_id);
    this.handleCloseRemove();
  }

  handleToggleAttachement() {
    this.props.onToggleAttach(this.props.document.document_id);
    this.handlePopoverClose();
  }

  render() {
    const {
      t,
      document,
      onRemoveDocument,
      onToggleAttach,
      attached,
      tagsMap,
      exercisesMap,
      scenariosMap,
      disabled,
    } = this.props;
    const documentTags = tagOptions(document.document_tags, tagsMap);
    const documentExercises = exerciseOptions(
      document.document_exercises,
      exercisesMap,
    );
    const documentScenarios = scenarioOptions(
      document.document_scenarios,
      scenariosMap,
    );
    const initialValues = R.pipe(
      R.assoc('document_tags', documentTags),
      R.assoc('document_exercises', documentExercises),
      R.assoc('document_scenarios', documentScenarios),
      R.pick([
        'document_name',
        'document_description',
        'document_type',
        'document_tags',
        'document_exercises',
        'document_scenarios',
      ]),
    )(document);
    return (
      <div>
        <IconButton
          color="primary"
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
          <MenuItem onClick={this.handleOpenEdit.bind(this)}>
            {t('Update')}
          </MenuItem>
          {onToggleAttach && (
            <MenuItem onClick={this.handleToggleAttachement.bind(this)}>
              {attached ? t('Disable attachment') : t('Enable attachment')}
            </MenuItem>
          )}
          {onRemoveDocument && (
            <MenuItem onClick={this.handleOpenRemove.bind(this)}>
              {t('Remove from the element')}
            </MenuItem>
          )}
          {!onRemoveDocument && (
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
              {t('Do you want to delete this document?')}
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
          <DialogTitle>{t('Update the document')}</DialogTitle>
          <DialogContent>
            <DocumentForm
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
              {t('Do you want to remove the document from the element?')}
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

const select = (state) => {
  const helper = storeHelper(state);
  const user = helper.getMe();
  return {
    user,
    userAdmin: user?.user_admin,
  };
};

DocumentPopover.propTypes = {
  t: PropTypes.func,
  document: PropTypes.object,
  updateDocument: PropTypes.func,
  deleteDocument: PropTypes.func,
  userAdmin: PropTypes.bool,
  tagsMap: PropTypes.object,
  exercisesMap: PropTypes.object,
  scenariosMap: PropTypes.object,
  onRemoveDocument: PropTypes.func,
  onToggleAttach: PropTypes.func,
  attached: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default R.compose(
  connect(select, { updateDocument, deleteDocument }),
  inject18n,
)(DocumentPopover);
