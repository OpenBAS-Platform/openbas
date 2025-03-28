import { Alert, AlertTitle } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { customDashboard } from '../../../../actions/custom_dashboards/customdashboard-action';
import { series } from '../../../../actions/dashboards/dashboard-action';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type CustomDashboard } from '../../../../utils/api-types';
import WidgetCreation from './widgets/WidgetCreation';

const CustomDashboardComponent = () => {
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

        // DASHBOARD

        response.data.custom_dashboard_widgets?.map((w) => {
          if (w.widget_config.mode === 'structural') {
            series(w.widget_id).then(res => console.log(res));
          } else if (w.widget_config.mode === 'temporal') {
            series(w.widget_id).then(res => console.log(res));
          }
        });
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
    <>
      <WidgetCreation customDashboardId={customDashboardId} />
    </>
  );
};

export default CustomDashboardComponent;
