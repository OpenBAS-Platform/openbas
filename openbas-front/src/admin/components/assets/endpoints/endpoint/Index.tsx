import { makeStyles } from '@mui/styles';
import { lazy } from 'react';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../../components/i18n';

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
  const classes = useStyles();
  const { t } = useFormatter();

  // Fetching data

  return (
    <Breadcrumbs
    variant="object"
    elements={[
      { label: t('Assets'), link: '/admin/assets' },
      { label: t('Endpoints'), link: '/admin/assets/endpoints' },
    ]}
  />
  );
};

export default Index;
