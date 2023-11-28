import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { PopoverProps } from '@mui/material';
import { useFormatter } from '../../../components/i18n';
import { updateMedia } from '../../../actions/Media';
import MediaForm from './MediaForm';
import { useAppDispatch } from '../../../utils/hooks';
import Transition from '../../../components/common/Transition';
import { Media, MediaUpdateInput } from '../../../utils/api-types';

const useStyles = makeStyles(() => ({
  button: {
    float: 'left',
    margin: '-10px 0 0 5px',
  },
}));

interface Props {
  media: Media
}

const MediaPopover: React.FC<Props> = ({ media }) => {
  const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handlePopoverOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => setAnchorEl(null);

  const handleOpenEdit = () => {
    setOpenEdit(true);
    handlePopoverClose();
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };

  const onSubmitEdit = async (data: MediaUpdateInput) => {
    await dispatch(updateMedia(media.media_id, data));
    setOpenEdit(false);
  };

  const submitDelete = async () => {
    await dispatch(updateMedia(media.media_id));
    setOpenDelete(false);
    navigate('/admin/medias');
  };

  const initialValues = {
    media_type: media.media_type,
    media_name: media.media_name,
    media_description: media.media_description,
  };

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
        <MenuItem onClick={handleOpenEdit}>
          {t('Update')}
        </MenuItem>
        <MenuItem onClick={handleOpenDelete}>
          {t('Delete')}
        </MenuItem>
      </Menu>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={() => setOpenDelete(false)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this media?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Update the media')}</DialogTitle>
        <DialogContent>
          <MediaForm
            initialValues={initialValues}
            editing={true}
            onSubmit={onSubmitEdit}
            handleClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaPopover;
