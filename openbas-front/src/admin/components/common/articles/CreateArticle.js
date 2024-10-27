import { useContext } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import ArticleForm from './ArticleForm';
import { ArticleContext } from '../Context';
import Transition from '../../../../components/common/Transition';

const useStyles = makeStyles((theme) => ({
  createButton: {
    float: 'left',
    marginTop: -15,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

const CreateArticle = (props) => {
  const { onCreate, inline, openCreate, handleOpenCreate, handleCloseCreate } = props;
  const classes = useStyles();
  const { t } = useFormatter();

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
          return handleCloseCreate();
        }
        return result;
      },
    );
  };
  return (
    <>
      {inline === true ? (
        <ListItem
          button
          divider
          onClick={handleOpenCreate}
          color="primary"
        >
          <ListItemIcon color="primary">
            <ControlPointOutlined color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('Create a new media pressure article')}
            classes={{ primary: classes.text }}
          />
        </ListItem>
      ) : (
        <IconButton
          color="primary"
          aria-label="Add"
          onClick={handleOpenCreate}
          classes={{ root: classes.createButton }}
          size="large"
        >
          <Add fontSize="small" />
        </IconButton>
      )}
      <Dialog
        open={openCreate}
        TransitionComponent={Transition}
        onClose={handleCloseCreate}
        fullWidth
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Create a new media pressure article')}</DialogTitle>
        <DialogContent style={{ overflowX: 'hidden' }}>
          <ArticleForm
            editing={false}
            onSubmit={onSubmit}
            handleClose={handleCloseCreate}
            initialValues={{
              article_name: '',
              article_channel: '' }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateArticle;
