import { Dialog as DialogMUI, DialogTitle, DialogContent, Breakpoint } from '@mui/material';
import { FunctionComponent } from 'react';
import * as React from 'react';
import Transition from './Transition';

interface DialogProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  children: (() => React.ReactElement) | React.ReactElement | null;
  maxWidth?: Breakpoint;
}

const Dialog: FunctionComponent<DialogProps> = ({
  open = false,
  handleClose,
  title,
  children,
  maxWidth = 'md',
}) => {
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
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ elevation: 1 }}
      TransitionComponent={Transition}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{component}</DialogContent>
    </DialogMUI>
  );
};

export default Dialog;
