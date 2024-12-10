import { makeStyles } from '@mui/styles';
import { Route, Routes } from 'react-router';

import { errorWrapper } from '../components/Error';
import NotFound from '../components/NotFound';
import type { Theme } from '../components/Theme';
import useDataLoader from '../utils/hooks/useDataLoader';
import Dashboard from './components/Dashboard';
import TopBar from './components/nav/TopBar';

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    minWidth: 1280,
    height: '100%',
  },
  content: {
    height: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: '24px 24px 24px 204px',
    minWidth: 0,
  },
  toolbar: theme.mixins.toolbar,
}));

const Index = () => {
  const classes = useStyles();
  useDataLoader();
  return (
    <div className={classes.root}>
      <TopBar />
      <main className={classes.content} style={{ paddingRight: 24 }}>
        <div className={classes.toolbar} />
        <Routes>
          <Route path="/" element={errorWrapper(Dashboard)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default Index;
