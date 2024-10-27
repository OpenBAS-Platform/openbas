import { Add } from '@mui/icons-material';
import { Fab } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FunctionComponent } from 'react';

const useStyles = makeStyles(() => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
}));

interface Props {
  onClick: () => void;
}

const ButtonCreate: FunctionComponent<Props> = ({
  onClick,
}) => {
  // Standard hooks
  const classes = useStyles();

  return (
    <Fab
      onClick={onClick}
      color="primary"
      aria-label="Add"
      className={classes.createButton}
    >
      <Add />
    </Fab>
  );
};

export default ButtonCreate;
