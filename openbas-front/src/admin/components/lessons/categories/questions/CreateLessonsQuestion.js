import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Dialog, DialogTitle, DialogContent, Slide, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../../../../components/i18n';
import LessonsQuestionForm from './LessonsQuestionForm';
import { addLessonsQuestion } from '../../../../../../../actions/Lessons';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles((theme) => ({
  createButton: {
    float: 'left',
    margin: '-15px 0 0 5px',
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

const CreateLessonsQuestion = (props) => {
  const { onCreate, inline, exerciseId, lessonsCategoryId } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onSubmit = (data) => {
    return dispatch(
      addLessonsQuestion(exerciseId, lessonsCategoryId, data),
    ).then((result) => {
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
            primary={t('Create a new lessons learned question')}
            classes={{ primary: classes.text }}
          />
        </ListItem>
      ) : (
        <IconButton
          classes={{ root: classes.createButton }}
          onClick={handleOpen}
          aria-haspopup="true"
          size="large"
          color="secondary"
        >
          <Add fontSize="small" />
        </IconButton>
      )}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Create a new lessons learned question')}</DialogTitle>
        <DialogContent>
          <LessonsQuestionForm
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

export default CreateLessonsQuestion;
