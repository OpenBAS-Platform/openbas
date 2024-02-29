import React, { useState } from 'react';
import * as R from 'ramda';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, Slide, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import LessonsTemplateQuestionForm from './LessonsTemplateQuestionForm';
import { useFormatter } from '../../../../../components/i18n';
import { deleteLessonsTemplateQuestion, updateLessonsTemplateQuestion } from '../../../../../actions/Lessons';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const LessonsTemplateQuestionPopover = ({
  lessonsTemplateId,
  lessonsTemplateCategoryId,
  lessonsTemplateQuestion,
}) => {
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
    return dispatch(
      updateLessonsTemplateQuestion(
        lessonsTemplateId,
        lessonsTemplateCategoryId,
        lessonsTemplateQuestion.lessonstemplatequestion_id,
        data,
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
    dispatch(
      deleteLessonsTemplateQuestion(
        lessonsTemplateId,
        lessonsTemplateCategoryId,
        lessonsTemplateQuestion.lessonstemplatequestion_id,
      ),
    ).then(() => handleCloseDelete());
  };
  // Rendering
  const initialValues = R.pipe(
    R.pick([
      'lessons_template_question_content',
      'lessons_template_question_explanation',
      'lessons_template_question_order',
    ]),
  )(lessonsTemplateQuestion);
  return (
    <div>
      <IconButton onClick={handlePopoverOpen} aria-haspopup="true" size="large">
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
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
            {t('Do you want to delete this lessons learned question?')}
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
        <DialogTitle>{t('Update the lessons learned question')}</DialogTitle>
        <DialogContent>
          <LessonsTemplateQuestionForm
            editing={true}
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
            initialValues={initialValues}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonsTemplateQuestionPopover;
