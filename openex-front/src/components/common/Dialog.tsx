import DialogMUI from '@mui/material/Dialog';
import React, { FunctionComponent } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { makeStyles } from '@mui/styles';
import { Theme } from '../Theme';
import Transition from './Transition';

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

interface DialogProps {
  open: boolean
  handleClose: () => void
  title: string
  children:
    | (() => React.ReactElement)
    | React.ReactElement
    | null
}

const Dialog: FunctionComponent<DialogProps> = ({
  open = false,
  handleClose,
  title,
  children,
}) => {
  const classes = useStyles();

  let component;
  if (children) {
    if (typeof children === 'function') {
      component = children();
    } else {
      component = React.cloneElement(children as React.ReactElement);
    }
  }

  return (
    <DialogMUI
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth="md"
      PaperProps={{ elevation: 1 }}
      TransitionComponent={Transition}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {component}
      </DialogContent>
    </DialogMUI>
  )
}

export default Dialog;
