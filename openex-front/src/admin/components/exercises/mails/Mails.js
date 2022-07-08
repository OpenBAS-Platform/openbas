import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import AnimationMenu from '../AnimationMenu';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 100px 0 0',
  },
}));

const Mails = () => {
  const classes = useStyles();
  const { exerciseId } = useParams();
  return (
    <div className={classes.container}>
      <AnimationMenu exerciseId={exerciseId} />
      Mails
    </div>
  );
};

export default Mails;
