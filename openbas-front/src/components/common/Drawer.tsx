import { Drawer as DrawerMUI, IconButton, Typography } from '@mui/material';
import React, { FunctionComponent } from 'react';
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
  },
  header: {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.default : theme.palette.background.nav,
    padding: '10px 0',
    display: 'inline-flex',
    alignItems: 'center',
  },
  container: {
    padding: '10px 20px 20px 20px',
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
}

const Drawer: FunctionComponent<DrawerProps> = ({
  open = false,
  handleClose,
  title,
  children,
  variant = 'half',
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
      elevation={1}
      sx={{ zIndex: 1202 }}
      classes={{ paper: variant === 'full' ? classes.drawerPaperFull : classes.drawerPaperHalf }}
      onClose={handleClose}
    >
      <div className={classes.header}>
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
      <div className={classes.container}>{component}</div>
    </DrawerMUI>
  );
};

export default Drawer;
