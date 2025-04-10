import { type Breakpoint, Dialog as DialogMUI, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { cloneElement, type FunctionComponent, type ReactElement, type ReactNode } from 'react';

import Transition from './Transition';

interface DialogProps {
  open: boolean;
  handleClose: () => void;
  title: ReactNode;
  children: (() => ReactElement) | ReactElement | null;
  actions?: ReactNode;
  maxWidth?: Breakpoint;
  className?: string;
}

const Dialog: FunctionComponent<DialogProps> = ({
  open = false,
  handleClose,
  title,
  children,
  actions,
  maxWidth = 'md',
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
      PaperProps={{ elevation: 1 }}
      TransitionComponent={Transition}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{component}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </DialogMUI>
  );
};

export default Dialog;
