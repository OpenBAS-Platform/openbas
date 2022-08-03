import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import ResultsMenu from '../ResultsMenu';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 100px 0 0',
  },
}));

const Reports = () => {
  const classes = useStyles();
  const { exerciseId } = useParams();
  return (
    <div className={classes.container}>
      <ResultsMenu exerciseId={exerciseId} />
      Reports
    </div>
  );
};

export default Reports;
