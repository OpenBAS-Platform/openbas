import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useContext } from 'react';

import { type Widget } from '../../../../utils/api-types-custom';
import CustomDashboardComponent from './CustomDashboard';
import { CustomDashboardContext } from './CustomDashboardContext';
import CustomDashboardHeader from './CustomDashboardHeader';
import WidgetCreation from './widgets/WidgetCreation';

const CustomDashboardWrapper: FunctionComponent<{ readOnly: boolean }> = ({ readOnly }) => {
  // Standard hooks
  const theme = useTheme();
  const { customDashboard, setCustomDashboard } = useContext(CustomDashboardContext);

  const handleWidgetCreate = (newWidget: Widget) => {
    setCustomDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        custom_dashboard_widgets: [...(prev.custom_dashboard_widgets ?? []), newWidget],
      };
    });
  };

  return (
    <div style={{
      display: 'grid',
      gap: theme.spacing(2),
    }}
    >
      <CustomDashboardHeader />
      <CustomDashboardComponent readOnly={readOnly} />
      {customDashboard && (
        <WidgetCreation
          customDashboardId={customDashboard.custom_dashboard_id}
          widgets={customDashboard?.custom_dashboard_widgets ?? []}
          onCreate={widget => handleWidgetCreate(widget)}
        />
      )}
    </div>
  );
};

export default CustomDashboardWrapper;
