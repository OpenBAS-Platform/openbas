import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import ListItem from '@mui/material/ListItem';
import { ListItemIcon } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../../components/i18n';
import { addLessonsTemplateQuestion } from '../../../../../actions/Lessons';
import LessonsTemplateQuestionForm from './LessonsTemplateQuestionForm';

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

const CreateLessonsTemplateQuestion = (props) => {
  const { onCreate, inline, lessonsTemplateId, lessonsTemplateCategoryId } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onSubmit = (data) => {
    return dispatch(
      addLessonsTemplateQuestion(
        lessonsTemplateId,
        lessonsTemplateCategoryId,
        data,
      ),
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
      {inline === true
        ? (
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
          )
        : (
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
          <LessonsTemplateQuestionForm
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

export default CreateLessonsTemplateQuestion;
