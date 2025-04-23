import { Alert, AlertTitle } from '@mui/material';
import { type FunctionComponent, lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { customDashboard } from '../../../../actions/custom_dashboards/customdashboard-action';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { errorWrapper } from '../../../../components/Error';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import NotFound from '../../../../components/NotFound';
import { type CustomDashboard } from '../../../../utils/api-types';

const CustomDashboard = lazy(() => import('./CustomDashboard'));

const CustomDashboardIndexComponent: FunctionComponent<{ customDashboard: CustomDashboard }> = ({ customDashboard }) => {
  // Standard hooks
  const { t } = useFormatter();

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
            label: customDashboard.custom_dashboard_name,
            current: true,
          }]}
      />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="" element={errorWrapper(CustomDashboard)({ customDashboard })} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const CustomDashboardIndex = () => {
  // Standard hooks
  const { t } = useFormatter();

  const { customDashboardId } = useParams() as { customDashboardId: CustomDashboard['custom_dashboard_id'] };
  const [customDashboardValue, setCustomDashboardValue] = useState<CustomDashboard>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customDashboard(customDashboardId).then((response) => {
      if (response.data) {
        setCustomDashboardValue(response.data);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!loading && !customDashboardValue) {
    return (
      <Alert severity="warning">
        <AlertTitle>{t('Warning')}</AlertTitle>
        {t('Custom dashboard is currently unavailable or you do not have sufficient permissions to access it.')}
      </Alert>
    );
  }

  return (
    <CustomDashboardIndexComponent customDashboard={customDashboardValue!} />
  );
};

export default CustomDashboardIndex;
