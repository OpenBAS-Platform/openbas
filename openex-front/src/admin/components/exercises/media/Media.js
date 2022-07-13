import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import PlanningMenu from '../PlanningMenu';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 100px 0 0',
  },
}));

const Media = () => {
  const classes = useStyles();
  const { exerciseId } = useParams();
  return (
    <div className={classes.container}>
      <PlanningMenu exerciseId={exerciseId} />
      Medias
    </div>
  );
};

export default Media;
