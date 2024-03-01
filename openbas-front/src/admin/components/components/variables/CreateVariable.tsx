import React, { useContext, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Fab, ListItem, ListItemIcon, ListItemText, Theme } from '@mui/material';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import VariableForm from './VariableForm';
import type { VariableInput } from '../../../../utils/api-types';
import Transition from '../../../../components/common/Transition';
import { VariableContext } from '../Context';

const useStyles = makeStyles((theme: Theme) => ({
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

interface Props {
  inline?: boolean;
}

const CreateVariable: React.FC<Props> = ({
  inline,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  // Context
  const { onCreateVariable } = useContext(VariableContext);

  // Creation
  const [open, setOpen] = useState(false);
  const onSubmit = (data: VariableInput) => {
    onCreateVariable(data);
    setOpen(false);
  };

  return (
    <div>
      {inline ? (
        <ListItem
          button
          divider
          onClick={() => setOpen(true)}
          color="primary"
        >
          <ListItemIcon color="primary">
            <ControlPointOutlined color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('Create a new variable')}
            classes={{ primary: classes.text }}
          />
        </ListItem>
      ) : (
        <Fab
          onClick={() => setOpen(true)}
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
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Create a new variable')}</DialogTitle>
        <DialogContent>
          <VariableForm
            onSubmit={onSubmit}
            handleClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateVariable;
