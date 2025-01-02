import { makeStyles } from '@mui/styles';
import { lazy } from 'react';

const useStyles = makeStyles(() => ({
  item: {
    height: 30,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const Endpoint = lazy(() => import('./Endpoint'));

const Index = () => {
  // Fetching data
  return (<></>);
};

export default Index;
