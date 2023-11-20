import DrawerMUI from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import React, { FunctionComponent } from 'react';
import { Close } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { Theme } from '../Theme';

const useStyles = makeStyles((theme: Theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
  },
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: `${theme.spacing(1)} 0`,
    display: 'inline-flex',
    alignItems: 'center',
  },
  container: {
    padding: `${theme.spacing(2)} ${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3)}`,
  },
}));

interface DrawerProps {
  open: boolean
  handleClose: () => void
  title: string
  children:
    | (() => React.ReactElement)
    | React.ReactElement
    | null
}

const Drawer: FunctionComponent<DrawerProps> = ({
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
    <DrawerMUI
      open={open}
      anchor="right"
      elevation={1}
      sx={{ zIndex: 1202 }}
      classes={{ paper: classes.drawerPaper }}
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
        <Typography variant="h6">{title}</Typography>
      </div>
      <div className={classes.container}>{component}</div>
    </DrawerMUI>
  );
}

export default Drawer;
