import React from 'react';
import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useHelper } from '../../../../store';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
  title: {
    textTransform: 'uppercase',
  },
}));

const InjectorHeader = () => {
  const classes = useStyles();
  const { injectorId } = useParams();
  const { injector } = useHelper((helper) => ({
    injector: helper.getInjector(injectorId),
  }));
  return (
    <div className={classes.container}>
      <Typography
        variant="h1"
        gutterBottom={true}
        classes={{ root: classes.title }}
      >
        {injector.injector_name}
      </Typography>
    </div>
  );
};

export default InjectorHeader;
