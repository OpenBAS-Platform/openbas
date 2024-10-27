import { lazy } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { fetchInjector } from '../../../../actions/Injectors';
import Loader from '../../../../components/Loader';
import InjectorHeader from './InjectorHeader';
import { errorWrapper } from '../../../../components/Error';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import type { Injector as InjectorType } from '../../../../utils/api-types';
import NotFound from '../../../../components/NotFound';
import type { InjectorHelper } from '../../../../actions/injectors/injector-helper';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const InjectorContracts = lazy(() => import('./InjectorContracts'));

const Index = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { injectorId } = useParams() as { injectorId: InjectorType['injector_id'] };
  const { injector } = useHelper((helper: InjectorHelper) => ({
    injector: helper.getInjector(injectorId),
  }));
  useDataLoader(() => {
    dispatch(fetchInjector(injectorId));
  });
  if (injector) {
    return (
      <div className={classes.root}>
        <Breadcrumbs
          variant="list"
          elements={[
            { label: t('Integrations') },
            { label: t('Injectors'), link: '/admin/integrations/injectors' },
            { label: injector.injector_name, current: true },
          ]}
        />
        <InjectorHeader />
        <div className="clearfix" />
        <Routes>
          <Route path="" element={errorWrapper(InjectorContracts)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </div>
    );
  }
  return <Loader />;
};

export default Index;
