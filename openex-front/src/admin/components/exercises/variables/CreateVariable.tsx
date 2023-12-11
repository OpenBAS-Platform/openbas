import React, { useState } from 'react';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import ListItem from '@mui/material/ListItem';
import { ListItemIcon, Theme } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import { addVariable } from '../../../../actions/Variable';
import { useAppDispatch } from '../../../../utils/hooks';
import { VariableInput } from '../../../../utils/api-types';
import Transition from '../../../../components/common/Transition';
import VariableForm from './VariableForm';

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
  exerciseId: string
  inline?: boolean
}

const CreateVariable: React.FC<Props> = ({ exerciseId, inline }) => {
  // Standard hooks
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();

  const dispatch = useAppDispatch();
  const onSubmit = (data: VariableInput) => {
    dispatch(addVariable(exerciseId, data));
    setOpen(false);
  };

  return (
    <div>
      {inline
        ? (
          <ListItem
            button={true}
            divider={true}
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
          )
        : (
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
        fullWidth={true}
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
