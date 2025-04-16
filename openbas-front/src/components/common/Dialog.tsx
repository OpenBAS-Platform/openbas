import { type Breakpoint, Dialog as DialogMUI, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { cloneElement, type FunctionComponent, type ReactElement, type ReactNode } from 'react';

import Transition from './Transition';

interface DialogProps {
  open: boolean;
  handleClose: () => void;
  title: ReactNode;
  children: (() => ReactElement) | ReactElement | null;
  maxWidth?: Breakpoint;
  className?: string;
  actions?: ReactElement | null;
  action?: ReactElement | null;
}

const Dialog: FunctionComponent<DialogProps> = ({
  open = false,
  handleClose,
  title,
  children,
  maxWidth = 'md',
  actions,
  className,
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
      className={className}
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={maxWidth}
      slots={{ transition: Transition }}
      slotProps={{ paper: { elevation: 1 } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{component}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </DialogMUI>
  );
};

export default Dialog;
