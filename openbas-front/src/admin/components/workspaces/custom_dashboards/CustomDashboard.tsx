import { Alert, AlertTitle, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import RGL, { type Layout, WidthProvider } from 'react-grid-layout';
import { useParams } from 'react-router';

import { customDashboard } from '../../../../actions/custom_dashboards/customdashboard-action';
import { updateCustomDashboardWidgetLayout } from '../../../../actions/custom_dashboards/customdashboardwidget-action';
import { ErrorBoundary } from '../../../../components/Error';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type CustomDashboard, type Widget } from '../../../../utils/api-types';
import WidgetCreation from './widgets/WidgetCreation';
import WidgetPopover from './widgets/WidgetPopover';
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

  const handleWidgetCreate = (newWidget: Widget) => {
    setCustomDashboardValue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        custom_dashboard_widgets: [...(prev.custom_dashboard_widgets ?? []), newWidget],
      };
    });
  };
  const handleWidgetUpdate = (widget: Widget) => {
    setCustomDashboardValue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        custom_dashboard_widgets: (prev.custom_dashboard_widgets ?? []).map((w) => {
          if (w.widget_id === widget.widget_id) {
            return widget;
          } else {
            return w;
          }
        }),
      };
    });
  };
  const handleWidgetDelete = (widgetId: string) => {
    setCustomDashboardValue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        custom_dashboard_widgets: (prev.custom_dashboard_widgets ?? []).filter(w => w.widget_id !== widgetId),
      };
    });
  };

  const onLayoutChange = async (layouts: Layout[]) => {
    await Promise.all(
      layouts.map(layout =>
        updateCustomDashboardWidgetLayout(customDashboardId, layout.i, {
          widget_layout_h: layout.h,
          widget_layout_w: layout.w,
          widget_layout_x: layout.x,
          widget_layout_y: layout.y,
        }),
      ),
    );
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
              <Typography variant="h3">
                {widget.widget_config.title}
              </Typography>
              <WidgetPopover
                className="noDrag"
                customDashboardId={customDashboardId}
                widget={widget}
                onUpdate={widget => handleWidgetUpdate(widget)}
                onDelete={widgetId => handleWidgetDelete(widgetId)}
              />
              <ErrorBoundary>
                {widget.widget_id === idToResize ? (<div />) : (
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
        onCreate={widget => handleWidgetCreate(widget)}
      />
    </div>
  );
};

export default CustomDashboardComponent;
