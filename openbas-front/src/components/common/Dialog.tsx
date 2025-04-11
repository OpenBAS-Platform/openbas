import { type Breakpoint, Dialog as DialogMUI, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { cloneElement, type FunctionComponent, type ReactElement } from 'react';

import Transition from './Transition';

interface DialogProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  children: (() => ReactElement) | ReactElement | null;
  maxWidth?: Breakpoint;
  action?: ReactElement | null;
}

const Dialog: FunctionComponent<DialogProps> = ({
  open = false,
  handleClose,
  title,
  children,
  maxWidth = 'md',
  action,
}) => {
  let component;
  if (children) {
    if (typeof children === 'function') {
      component = children();
    } else {
      component = cloneElement(children as ReactElement);
    }
  }

  return (
    <DialogMUI
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={maxWidth}
      slots={{ transition: Transition }}
      slotProps={{ paper: { elevation: 1 } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{component}</DialogContent>
      {action && (
        <DialogActions>
          {action}
        </DialogActions>
      )}
    </DialogMUI>
  );
};

export default Dialog;
