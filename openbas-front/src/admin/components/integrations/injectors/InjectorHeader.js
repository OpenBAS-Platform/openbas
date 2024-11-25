import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router';

import { useHelper } from '../../../../store';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
}));

const InjectorHeader = () => {
  const classes = useStyles();
  const { injectorId } = useParams();
  const { injector } = useHelper(helper => ({
    injector: helper.getInjector(injectorId),
  }));
  return (
    <div className={classes.container}>
      <Typography
        variant="h1"
        gutterBottom={true}
      >
        {injector.injector_name}
      </Typography>
    </div>
  );
};

export default InjectorHeader;
