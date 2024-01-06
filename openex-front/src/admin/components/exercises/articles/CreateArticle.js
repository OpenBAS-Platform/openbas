import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Fab, Dialog, DialogTitle, DialogContent, Slide, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import { addExerciseArticle } from '../../../../actions/Channel';
import ArticleForm from './ArticleForm';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles((theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

const CreateArticle = (props) => {
  const { exerciseId, onCreate, inline } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onSubmit = (data) => {
    const inputValues = { ...data, article_channel: data.article_channel.id };
    return dispatch(addExerciseArticle(exerciseId, inputValues)).then(
      (result) => {
        if (result.result) {
          if (onCreate) {
            onCreate(result.result);
          }
          return handleClose();
        }
        return result;
      },
    );
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
            primary={t('Create a new channel pressure')}
            classes={{ primary: classes.text }}
          />
        </ListItem>
      ) : (
        <Fab
          onClick={handleOpen}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
      )}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Create a new channel pressure')}</DialogTitle>
        <DialogContent style={{ overflowX: 'hidden' }}>
          <ArticleForm
            editing={false}
            onSubmit={onSubmit}
            handleClose={handleClose}
            exerciseId={exerciseId}
            initialValues={{ article_name: '', article_channel: '' }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateArticle;
