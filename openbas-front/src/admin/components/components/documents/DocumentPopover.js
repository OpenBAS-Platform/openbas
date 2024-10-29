import { MoreVert } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Menu, MenuItem } from '@mui/material';
import * as R from 'ramda';
import { useState } from 'react';

import { deleteDocument, updateDocument } from '../../../../actions/Document';
import { fetchExercises } from '../../../../actions/Exercise';
import { fetchScenarios } from '../../../../actions/scenarios/scenario-actions';
import Drawer from '../../../../components/common/Drawer';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { exerciseOptions, scenarioOptions, tagOptions } from '../../../../utils/Option';
import DocumentForm from './DocumentForm';

const DocumentPopover = (props) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const { document, disabled, onRemoveDocument, attached, onToggleAttach, inline, onUpdate, onDelete } = props;

  // Fetching data
  const { tagsMap, exercisesMap, scenariosMap } = useHelper(helper => ({
    tagsMap: helper.getTagsMap(),
    exercisesMap: helper.getExercisesMap(),
    scenariosMap: helper.getScenariosMap(),
  }));
  if (!props.scenariosAndExercisesFetched) {
    useDataLoader(() => {
      dispatch(fetchExercises());
      dispatch(fetchScenarios());
    });
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);

  const handlePopoverOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleOpenEdit = () => {
    setOpenEdit(true);
    handlePopoverClose();
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  const onSubmitEdit = (data) => {
    const inputValues = R.pipe(
      R.assoc('document_tags', R.pluck('id', data.document_tags)),
      R.assoc('document_exercises', R.pluck('id', data.document_exercises)),
      R.assoc('document_scenarios', R.pluck('id', data.document_scenarios)),
    )(data);
    return dispatch(updateDocument(document.document_id, inputValues))
      .then((result) => {
        if (onUpdate) {
          const updated = result.entities.documents[result.result];
          onUpdate(updated);
        }
        handleCloseEdit();
      });
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const submitDelete = () => {
    dispatch(deleteDocument(document.document_id)).then(
      () => {
        if (onDelete) {
          onDelete(document.document_id);
        }
      },
    );
    handleCloseDelete();
  };

  const handleOpenRemove = () => {
    setOpenRemove(true);
    handlePopoverClose();
  };

  const handleCloseRemove = () => {
    setOpenRemove(false);
  };

  const submitRemove = () => {
    onRemoveDocument(document.document_id);
    handleCloseRemove();
  };

  const handleToggleAttachement = () => {
    onToggleAttach(document.document_id);
    handlePopoverClose();
  };

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
        onClick={handlePopoverOpen}
        aria-haspopup="true"
        size="large"
        disabled={disabled}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        {onUpdate && (
          <MenuItem onClick={handleOpenEdit}>
            {t('Update')}
          </MenuItem>
        )}
        {onToggleAttach && (
          <MenuItem onClick={handleToggleAttachement}>
            {attached ? t('Disable attachment') : t('Enable attachment')}
          </MenuItem>
        )}
        {onRemoveDocument && (
          <MenuItem onClick={handleOpenRemove}>
            {t('Remove from the element')}
          </MenuItem>
        )}
        {!onRemoveDocument && (
          <MenuItem onClick={handleOpenDelete} disabled={!document.document_can_be_deleted}>
            {t('Delete')}
          </MenuItem>
        )}
      </Menu>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this document?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {inline ? (
        <Dialog
          open={openEdit}
          handleClose={handleCloseEdit}
          title={t('Update the document')}
        >
          <DocumentForm
            initialValues={initialValues}
            editing
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
          />
        </Dialog>
      ) : (
        <Drawer
          open={openEdit}
          handleClose={handleCloseEdit}
          title={t('Update the document')}
        >
          <DocumentForm
            initialValues={initialValues}
            editing
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
          />
        </Drawer>
      )}

      <Dialog
        open={openRemove}
        TransitionComponent={Transition}
        onClose={handleCloseRemove}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to remove the document from the element?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemove}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitRemove}>
            {t('Remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentPopover;
