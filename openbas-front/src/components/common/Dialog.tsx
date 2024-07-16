import { Breakpoint, Dialog as DialogMUI, DialogTitle } from '@mui/material';
import React, { FunctionComponent } from 'react';
import Transition from './Transition';

interface DialogProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: Breakpoint;
  childrenStyle?: React.CSSProperties;
}

const Dialog: FunctionComponent<DialogProps> = ({
  open = false,
  handleClose,
  title,
  children,
  maxWidth = 'md',
  childrenStyle,
}) => {
  return (
    <DialogMUI
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ elevation: 1 }}
      TransitionComponent={Transition}
    >
      <DialogTitle style={{ paddingBottom: 5 }}>{title}</DialogTitle>
      <div style={childrenStyle}>{children}</div>
    </DialogMUI>);
};
export default Dialog;
