import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogTitle, ListItem, ListItemIcon, ListItemText, Slide } from '@mui/material';
import { ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../../../components/i18n';
import LessonsCategoryForm from './LessonsCategoryForm';
import { addLessonsCategory } from '../../../../../../actions/Lessons';
import ButtonCreate from '../../../../../../components/common/ButtonCreate';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles((theme) => ({
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

const CreateLessonsCategory = (props) => {
  const { onCreate, inline, exerciseId } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onSubmit = (data) => {
    return dispatch(addLessonsCategory(exerciseId, data)).then((result) => {
      if (result.result) {
        if (onCreate) {
          onCreate(result.result);
        }
        return handleClose();
      }
      return result;
    });
  };
  return (
    <div>
      {inline === true ? (
        <ListItem
          button={true}
          divider={true}
          onClick={handleOpen}
          color="primary"
        >
          <ListItemIcon color="primary">
            <ControlPointOutlined color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('Create a new lessons learned category')}
            classes={{ primary: classes.text }}
          />
        </ListItem>
      ) : (
        <ButtonCreate onClick={handleOpen} />
      )}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Create a new lessons learned category')}</DialogTitle>
        <DialogContent>
          <LessonsCategoryForm
            editing={false}
            onSubmit={onSubmit}
            handleClose={handleClose}
            initialValues={{}}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateLessonsCategory;
