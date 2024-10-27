import { MoreVert } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Slide } from '@mui/material';
import * as R from 'ramda';
import { forwardRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { deleteChallenge, updateChallenge } from '../../../../actions/Challenge';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import { tagOptions } from '../../../../utils/Option';
import ChallengeForm from './ChallengeForm';

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const ChallengePopover = ({ challenge, documents, onRemoveChallenge, inline }) => {
  // utils
  const dispatch = useDispatch();
  const { t } = useFormatter();
  // states
  const [openDelete, setOpenDelete] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  // popover management
  const { tagsMap } = useHelper(helper => ({
    tagsMap: helper.getTagsMap(),
  }));
  const handlePopoverOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => setAnchorEl(null);
  // Edit action
  const handleOpenEdit = () => {
    setOpenEdit(true);
    handlePopoverClose();
  };
  const handleCloseEdit = () => setOpenEdit(false);
  const onSubmitEdit = (data) => {
    const inputValues = R.pipe(
      R.assoc('challenge_tags', R.pluck('id', data.challenge_tags)),
    )(data);
    return dispatch(updateChallenge(challenge.challenge_id, inputValues)).then(
      () => handleCloseEdit(),
    );
  };
  // Delete action
  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    dispatch(deleteChallenge(challenge.challenge_id)).then(() => handleCloseDelete());
  };
  const handleOpenRemove = () => {
    setOpenRemove(true);
    handlePopoverClose();
  };
  const handleCloseRemove = () => {
    setOpenRemove(false);
  };
  const submitRemove = () => {
    onRemoveChallenge(challenge.challenge_id);
    handleCloseRemove();
  };
  // Rendering
  const challengeTags = tagOptions(challenge.challenge_tags, tagsMap);
  const initialValues = R.pipe(
    R.assoc('challenge_tags', challengeTags),
    R.pick([
      'challenge_name',
      'challenge_category',
      'challenge_content',
      'challenge_score',
      'challenge_tags',
      'challenge_max_attempts',
      'challenge_flags',
    ]),
  )(challenge);
  return (
    <>
      <IconButton onClick={handlePopoverOpen} aria-haspopup="true" size="large" color="primary">
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
        {onRemoveChallenge && (
          <MenuItem onClick={handleOpenRemove}>
            {t('Remove from the inject')}
          </MenuItem>
        )}
        <MenuItem onClick={handleOpenDelete}>{t('Delete')}</MenuItem>
      </Menu>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this challenge?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {inline ? (
        <Dialog
          open={openEdit}
          TransitionComponent={Transition}
          onClose={handleCloseEdit}
          fullWidth
          maxWidth="md"
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Update the challenge')}</DialogTitle>
          <DialogContent>
            <ChallengeForm
              editing
              onSubmit={onSubmitEdit}
              handleClose={handleCloseEdit}
              initialValues={initialValues}
              documentsIds={(documents || []).map(i => i.document_id)}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={openEdit}
          handleClose={handleCloseEdit}
          title={t('Update the challenge')}
        >
          <ChallengeForm
            editing
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
            initialValues={initialValues}
            documentsIds={(documents || []).map(i => i.document_id)}
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
            {t('Do you want to remove this challenge from the inject?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemove}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitRemove}>
            {t('Remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChallengePopover;
