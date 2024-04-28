import React, { useContext, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Fab, ListItem, ListItemIcon, ListItemText, Slide } from '@mui/material';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import ArticleForm from './ArticleForm';
import { ArticleContext } from '../../common/Context';

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
  const { onCreate, inline } = props;
  const classes = useStyles();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Context
  const { onAddArticle } = useContext(ArticleContext);

  const onSubmit = (data) => {
    const inputValues = { ...data, article_channel: data.article_channel.id };
    return onAddArticle(inputValues).then(
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
          button
          divider
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
        fullWidth
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Create a new channel pressure')}</DialogTitle>
        <DialogContent style={{ overflowX: 'hidden' }}>
          <ArticleForm
            editing={false}
            onSubmit={onSubmit}
            handleClose={handleClose}
            initialValues={{ article_name: '', article_channel: '' }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateArticle;
