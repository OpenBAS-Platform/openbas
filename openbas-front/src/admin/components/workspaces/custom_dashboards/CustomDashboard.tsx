import { Alert, AlertTitle, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import { useParams } from 'react-router';

import { customDashboard } from '../../../../actions/custom_dashboards/customdashboard-action';
import { ErrorBoundary } from '../../../../components/Error';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type CustomDashboard } from '../../../../utils/api-types';
import WidgetCreation from './widgets/WidgetCreation';
import WidgetStructuralViz from './widgets/WidgetStructuralViz';
import WidgetTemporalViz from './widgets/WidgetTemporalViz';

const CustomDashboardComponent = () => {
  // Standard hooks
  const theme = useTheme();
  const { t } = useFormatter();
  const ReactGridLayout = useMemo(() => WidthProvider(RGL), []);

  const { customDashboardId } = useParams() as { customDashboardId: CustomDashboard['custom_dashboard_id'] };
  const [customDashboardValue, setCustomDashboardValue] = useState<CustomDashboard>();
  const [loading, setLoading] = useState(true);

  const [idToResize, setIdToResize] = useState<string | null>(null);
  const handleResize = (updatedWidget: string | null) => setIdToResize(updatedWidget);

  useEffect(() => {
    customDashboard(customDashboardId).then((response) => {
      if (response.data) {
        setCustomDashboardValue(response.data);
        setLoading(false);
      }
    });
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1200);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const onLayoutChange = () => {
    // TODO implement
  };

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

  const paperStyle = {
    height: '100%',
    margin: 0,
    padding: theme.spacing(2),
    borderRadius: 4,
    display: 'relative',
    overflow: 'hidden',
  };

  return (
    <div
      id="container"
      style={{
        margin: '0 -20px 0 -20px',
        marginTop: 10,
      }}
    >
      <ReactGridLayout
        className="layout"
        margin={[20, 20]}
        rowHeight={50}
        cols={12}
        draggableCancel=".noDrag"
        isDraggable={true}
        isResizable={true}
        onLayoutChange={onLayoutChange}
        onResizeStart={(_, { i }) => handleResize(i)}
        onResizeStop={() => handleResize(null)}
      >
        {customDashboardValue?.custom_dashboard_widgets?.map((widget) => {
          const layout = {
            i: widget.widget_id,
            x: widget.widget_layout?.widget_layout_x,
            y: widget.widget_layout?.widget_layout_y,
            w: widget.widget_layout?.widget_layout_w,
            h: widget.widget_layout?.widget_layout_h,
          };
          return (
            <Paper
              key={widget.widget_id}
              data-grid={layout}
              style={paperStyle}
              variant="outlined"
            >
              <ErrorBoundary>
                {widget.widget_id === idToResize ? <div /> : (
                  <>
                    {widget.widget_config.mode === 'structural' && (
                      <WidgetStructuralViz widget={widget} />
                    )}
                    {widget.widget_config.mode === 'temporal' && (
                      <WidgetTemporalViz widget={widget} />
                    )}
                  </>
                )}
              </ErrorBoundary>
            </Paper>
          );
        })}
      </ReactGridLayout>
      <WidgetCreation
        customDashboardId={customDashboardId}
        widgets={customDashboardValue?.custom_dashboard_widgets ?? []}
      />
    </div>
  );
};

export default CustomDashboardComponent;
