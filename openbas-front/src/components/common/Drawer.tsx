import { Drawer as DrawerMUI, IconButton, type PaperProps, Typography } from '@mui/material';
import React, { CSSProperties, FunctionComponent } from 'react';
import { Close } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import type { Theme } from '../Theme';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  drawerPaperHalf: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperFull: {
    minHeight: '100vh',
    width: '100vw',
    position: 'fixed',
    overflow: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: theme.palette.background.default,
  },
  header: {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.default : theme.palette.background.nav,
    padding: '10px 0',
    display: 'inline-flex',
    alignItems: 'center',
  },
  headerFull: {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.default : theme.palette.background.nav,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '10px 0',
    display: 'inline-flex',
    alignItems: 'center',
  },
}));

interface DrawerProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  children:
  (() => React.ReactElement)
  | React.ReactElement
  | null;
  variant?: 'full' | 'half';
  PaperProps?: PaperProps
  disableEnforceFocus?: boolean
  containerStyle?: CSSProperties
}

const Drawer: FunctionComponent<DrawerProps> = ({
  open = false,
  handleClose,
  title,
  children,
  variant = 'half',
  PaperProps = undefined,
  disableEnforceFocus = false,
  containerStyle = {},
}) => {
  const classes = useStyles({ variant });
  let component;
  if (children) {
    if (typeof children === 'function') {
      component = children();
    } else {
      component = React.cloneElement(children as React.ReactElement);
    }
  }
  return (
    <DrawerMUI
      open={open}
      anchor="right"
      elevation={variant === 'full' ? 0 : 1}
      sx={{ zIndex: 1202 }}
      classes={{ paper: variant === 'full' ? classes.drawerPaperFull : classes.drawerPaperHalf }}
      onClose={handleClose}
      PaperProps={PaperProps}
      ModalProps={{
        disableEnforceFocus,
      }}
    >
      <div className={variant === 'full' ? classes.headerFull : classes.header}>
        <IconButton
          aria-label="Close"
          onClick={handleClose}
          size="large"
          color="primary"
        >
          <Close fontSize="small" color="primary" />
        </IconButton>
        <Typography variant="subtitle2">{title}</Typography>
      </div>
      <div style={{ padding: '10px 20px 20px 20px', ...containerStyle }}>{component}</div>
    </DrawerMUI>
  );
};

export default Drawer;
