import { OpenInFullOutlined } from '@mui/icons-material';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useEffect, useMemo, useState } from 'react';
import RGL, { type Layout, WidthProvider } from 'react-grid-layout';
import { useParams } from 'react-router';

import { updateCustomDashboardWidgetLayout } from '../../../../actions/custom_dashboards/customdashboardwidget-action';
import { ErrorBoundary } from '../../../../components/Error';
import { useFormatter } from '../../../../components/i18n';
import { type CustomDashboard } from '../../../../utils/api-types';
import { type Widget } from '../../../../utils/api-types-custom';
import CustomDashboardHeader from './CustomDashboardHeader';
import WidgetCreation from './widgets/WidgetCreation';
import WidgetPopover from './widgets/WidgetPopover';
import { getWidgetTitle } from './widgets/WidgetUtils';
import WidgetViz from './widgets/WidgetViz';

const CustomDashboardComponent: FunctionComponent<{ customDashboard: CustomDashboard }> = ({ customDashboard }) => {
  // Standard hooks
  const theme = useTheme();
  const { t } = useFormatter();
  const ReactGridLayout = useMemo(() => WidthProvider(RGL), []);
  const [fullscreenWidgets, setFullscreenWidgets] = useState<Record<Widget['widget_id'], boolean | never>>({});

  const { customDashboardId } = useParams() as { customDashboardId: CustomDashboard['custom_dashboard_id'] };
  const [customDashboardValue, setCustomDashboardValue] = useState<CustomDashboard>(customDashboard);

  const [idToResize, setIdToResize] = useState<string | null>(null);
  const handleResize = (updatedWidget: string | null) => setIdToResize(updatedWidget);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [customDashboardValue]);

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
    setCustomDashboardValue(prev => prev && {
      ...prev,
      custom_dashboard_widgets: prev.custom_dashboard_widgets?.map((widget) => {
        const existingLayout = layouts.find(x => x.i === widget.widget_id)!;
        if (!existingLayout) return widget;
        return {
          ...widget,
          widget_layout: {
            widget_layout_x: existingLayout.x,
            widget_layout_y: existingLayout.y,
            widget_layout_w: existingLayout.w,
            widget_layout_h: existingLayout.h,
          },
        };
      }),
    });
  };

  return (
    <div style={{
      display: 'grid',
      gap: theme.spacing(2),
    }}
    >
      <CustomDashboardHeader customDashboard={customDashboard} />
      {/* Not perfect to use negative margin here, but I don't find a better solution to align items */}
      <div id="container" style={{ margin: theme.spacing(-2.5) }}>
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
            const setFullscreen = (fullscreen: boolean) => setFullscreenWidgets({
              ...fullscreenWidgets,
              [widget.widget_id]: fullscreen,
            });
            return (
              <Paper
                key={widget.widget_id}
                data-grid={layout}
                style={{
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                }}
                variant="outlined"
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="h4"
                    sx={{
                      margin: 0,
                      paddingLeft: theme.spacing(2),
                      textTransform: 'uppercase',
                    }}
                  >
                    {getWidgetTitle(widget.widget_config.title, widget.widget_type, t)}
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection="row"
                  >
                    {widget.widget_type === 'security-coverage' && (
                      <IconButton
                        color="primary"
                        className="noDrag"
                        onClick={() => setFullscreen(true)}
                        size="small"
                      >
                        <OpenInFullOutlined fontSize="small" />
                      </IconButton>
                    )}
                    <WidgetPopover
                      className="noDrag"
                      customDashboardId={customDashboardId}
                      widget={widget}
                      onUpdate={widget => handleWidgetUpdate(widget)}
                      onDelete={widgetId => handleWidgetDelete(widgetId)}
                    />
                  </Box>
                </Box>
                <ErrorBoundary>
                  {widget.widget_id === idToResize ? (<div />) : (
                    <Box
                      flex={1}
                      display="flex"
                      flexDirection="column"
                      minHeight={0}
                      padding={theme.spacing(0, 2)}
                    >
                      <WidgetViz
                        widget={widget}
                        fullscreen={fullscreenWidgets[widget.widget_id]}
                        setFullscreen={setFullscreen}
                      />
                    </Box>
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
    </div>
  );
};

export default CustomDashboardComponent;
