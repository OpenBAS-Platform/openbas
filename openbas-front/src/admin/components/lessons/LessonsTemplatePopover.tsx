import React, { useState } from 'react';
import * as R from 'ramda';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, Menu, MenuItem, PopoverProps } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import LessonsTemplateForm from './LessonsTemplateForm';
import { useFormatter } from '../../../components/i18n';
import { deleteLessonsTemplate, updateLessonsTemplate } from '../../../actions/Lessons';
import Transition from '../../../components/common/Transition';
import type { LessonsTemplate, LessonsTemplateUpdateInput } from '../../../utils/api-types';
import { useAppDispatch } from '../../../utils/hooks';

const useStyles = makeStyles(() => ({
  button: {
    float: 'left',
    margin: '-10px 0 0 5px',
  },
}));

interface Props {
  lessonsTemplate: LessonsTemplate;
}

const LessonsTemplatePopover: React.FC<Props> = ({ lessonsTemplate }) => {
  // utils
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const classes = useStyles();
  const { t } = useFormatter();
  // states
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);
  // popover management
  const handlePopoverOpen = (event: React.MouseEvent) => {
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
  const onSubmitEdit = (data: LessonsTemplateUpdateInput) => {
    return dispatch(
      updateLessonsTemplate(lessonsTemplate.lessonstemplate_id, data),
    ).then(() => handleCloseEdit());
  };
  // Delete action
  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    dispatch(deleteLessonsTemplate(lessonsTemplate.lessonstemplate_id)).then(
      () => {
        handleCloseDelete();
        navigate('/admin/lessons');
      },
    );
  };
  // Rendering
  const initialValues = R.pipe(
    R.pick(['lessons_template_name', 'lessons_template_description']),
  )(lessonsTemplate);
  return (
    <div>
      <IconButton
        classes={{ root: classes.button }}
        onClick={handlePopoverOpen}
        aria-haspopup="true"
        size="large"
      >
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
            {t('Do you want to delete this lessons learned template?')}
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
        <DialogTitle>{t('Update the lessons learned template')}</DialogTitle>
        <DialogContent>
          <LessonsTemplateForm
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

export default LessonsTemplatePopover;
