import { useParams } from 'react-router';

import { type CustomDashboard } from '../../../../utils/api-types';
import WidgetCreation from './widgets/WidgetCreation';

const CustomDashboardComponent = () => {
  const { customDashboardId } = useParams() as { customDashboardId: CustomDashboard['custom_dashboard_id'] };

  return (
    <WidgetCreation customDashboardId={customDashboardId} />
  );
};

export default CustomDashboardComponent;
