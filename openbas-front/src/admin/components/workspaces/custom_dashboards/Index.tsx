import { Alert, AlertTitle } from '@mui/material';
import { type FunctionComponent, lazy, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { customDashboard } from '../../../../actions/custom_dashboards/customdashboard-action';
import { series } from '../../../../actions/dashboards/dashboard-action';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { errorWrapper } from '../../../../components/Error';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import NotFound from '../../../../components/NotFound';
import { type CustomDashboard } from '../../../../utils/api-types';
import { CustomDashboardContext } from './CustomDashboardContext';

const CustomDashboard = lazy(() => import('./CustomDashboard'));

const CustomDashboardIndexComponent: FunctionComponent = () => {
  // Standard hooks
  const { t } = useFormatter();

  const { customDashboardId } = useParams() as { customDashboardId: CustomDashboard['custom_dashboard_id'] };
  const { customDashboard, setCustomDashboard, fetchCustomDashboard } = useContext(CustomDashboardContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomDashboard(customDashboardId).then((response) => {
      if (response.data) {
        setCustomDashboard(response.data);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!loading && !customDashboard) {
    return (
      <Alert severity="warning">
        <AlertTitle>{t('Warning')}</AlertTitle>
        {t('Custom dashboard is currently unavailable or you do not have sufficient permissions to access it.')}
      </Alert>
    );
  }

  return (
    <>
      <Breadcrumbs
        variant="list"
        elements={[{ label: t('Dashboards') },
          {
            label: t('Custom dashboards'),
            link: '/admin/workspaces/custom_dashboards',
          },
          {
            label: customDashboard?.custom_dashboard_name ?? '',
            current: true,
          }]}
      />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route
            path=""
            element={errorWrapper(CustomDashboard)({
              customDashboard,
              readOnly: false,
            })}
          />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const CustomDashboardIndex = () => {
  const [customDashboardValue, setCustomDashboardValue] = useState<CustomDashboard>();
  const contextValue = useMemo(() => ({
    customDashboard: customDashboardValue,
    setCustomDashboard: setCustomDashboardValue,
    fetchCustomDashboard: (customDashboardId: string) => customDashboard(customDashboardId),
    series: (widgetId: string) => series(widgetId),
  }), [customDashboardValue, setCustomDashboardValue]);

  return (
    <CustomDashboardContext.Provider value={contextValue}>
      <CustomDashboardIndexComponent />
    </CustomDashboardContext.Provider>
  );
};

export default CustomDashboardIndex;
