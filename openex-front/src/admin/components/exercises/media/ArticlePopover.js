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
import { deleteExerciseArticle, updateExerciseArticle } from '../../../../actions/Media';
import ArticleForm from './ArticleForm';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const ArticlePopover = ({ article }) => {
  // utils
  const dispatch = useDispatch();
  const { t } = useFormatter();
  // states
  const [openDelete, setOpenDelete] = useState(false);
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
    return dispatch(updateExerciseArticle(article.article_id, inputValues)).then(() => handleCloseEdit());
  };
  // Delete action
  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    dispatch(deleteExerciseArticle(article.article_id)).then(() => handleCloseDelete());
  };
  // Rendering
  const initialValues = R.pipe(R.pick(['article_name', 'article_media']))(article);
  return (
      <div>
        <IconButton onClick={handlePopoverOpen} aria-haspopup="true" size="large">
          <MoreVert />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handlePopoverClose}>
          <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
          <MenuItem onClick={handleOpenDelete}>{t('Delete')}</MenuItem>
        </Menu>
        <Dialog open={openDelete} TransitionComponent={Transition} onClose={handleCloseDelete} PaperProps={{ elevation: 1 }}>
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this article?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="secondary" onClick={handleCloseDelete}>
              {t('Cancel')}
            </Button>
            <Button variant="contained" color="primary" onClick={submitDelete}>
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog TransitionComponent={Transition} open={openEdit} onClose={handleCloseEdit}
          fullWidth={true} maxWidth="md" PaperProps={{ elevation: 1 }}>
          <DialogTitle>{t('Update the article')}</DialogTitle>
          <DialogContent>
            <ArticleForm editing={true}
                onSubmit={onSubmitEdit}
                handleClose={handleCloseEdit}
                initialValues={initialValues}/>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default ArticlePopover;
