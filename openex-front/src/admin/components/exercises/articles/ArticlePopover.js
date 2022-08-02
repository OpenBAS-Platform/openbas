import React, { useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { useFormatter } from '../../../../components/i18n';
import {
  deleteExerciseArticle,
  updateExerciseArticle,
} from '../../../../actions/Media';
import ArticleForm from './ArticleForm';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const ArticlePopover = ({ exercise, article, documents, onRemoveArticle }) => {
  // utils
  const dispatch = useDispatch();
  const { t } = useFormatter();
  // states
  const [openDelete, setOpenDelete] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  // popover management
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
    const inputValues = { ...data, article_media: data.article_media.id };
    return dispatch(
      updateExerciseArticle(
        exercise.exercise_id,
        article.article_id,
        inputValues,
      ),
    ).then(() => handleCloseEdit());
  };
  // Delete action
  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    return dispatch(
      deleteExerciseArticle(exercise.exercise_id, article.article_id),
    ).then(() => handleCloseDelete());
  };
  const handleOpenRemove = () => {
    setOpenRemove(true);
    handlePopoverClose();
  };
  const handleCloseRemove = () => {
    setOpenRemove(false);
  };
  const submitRemove = () => {
    onRemoveArticle(article.article_id);
    handleCloseRemove();
  };
  // Rendering
  const initialValues = R.pipe(
    R.pick([
      'article_name',
      'article_content',
      'article_author',
      'article_shares',
      'article_likes',
      'article_comments',
      'article_media',
    ]),
  )(article);
  return (
    <React.Fragment>
      <IconButton onClick={handlePopoverOpen} aria-haspopup="true" size="large">
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
        {onRemoveArticle && (
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
            {t('Do you want to delete this media pressure?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openEdit}
        onClose={handleCloseEdit}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Update the media pressure')}</DialogTitle>
        <DialogContent style={{ overflowX: 'hidden' }}>
          <ArticleForm
            editing={true}
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
            exerciseId={exercise.exercise_id}
            initialValues={initialValues}
            documentsIds={(documents || []).map((i) => i.document_id)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={openRemove}
        TransitionComponent={Transition}
        onClose={handleCloseRemove}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to remove this media pressure from the inject?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseRemove}
          >
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitRemove}>
            {t('Remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default ArticlePopover;
