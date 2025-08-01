import { OpenInFullOutlined } from '@mui/icons-material';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import RGL, { type Layout, WidthProvider } from 'react-grid-layout';

import { updateCustomDashboardWidgetLayout } from '../../../../actions/custom_dashboards/customdashboardwidget-action';
import { ErrorBoundary } from '../../../../components/Error';
import { useFormatter } from '../../../../components/i18n';
import { type Widget } from '../../../../utils/api-types-custom';
import { CustomDashboardContext } from './CustomDashboardContext';
import CustomDashboardHeader from './CustomDashboardHeader';
import WidgetCreation from './widgets/WidgetCreation';
import WidgetPopover from './widgets/WidgetPopover';
import { getWidgetTitle } from './widgets/WidgetUtils';
import WidgetViz from './widgets/WidgetViz';

const CustomDashboardComponent: FunctionComponent<{ readOnly: boolean }> = ({ readOnly }) => {
  // Standard hooks
  const theme = useTheme();
  const { t } = useFormatter();
  const ReactGridLayout = useMemo(() => WidthProvider(RGL), []);
  const [fullscreenWidgets, setFullscreenWidgets] = useState<Record<Widget['widget_id'], boolean | never>>({});

  const { customDashboard, setCustomDashboard } = useContext(CustomDashboardContext);

  const [idToResize, setIdToResize] = useState<string | null>(null);
  const handleResize = (updatedWidget: string | null) => setIdToResize(updatedWidget);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [customDashboard]);

  const handleWidgetCreate = (newWidget: Widget) => {
    setCustomDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        custom_dashboard_widgets: [...(prev.custom_dashboard_widgets ?? []), newWidget],
      };
    });
  };
  const handleWidgetUpdate = (widget: Widget) => {
    setCustomDashboard((prev) => {
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
    setCustomDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        custom_dashboard_widgets: (prev.custom_dashboard_widgets ?? []).filter(w => w.widget_id !== widgetId),
      };
    });
  };

  const onLayoutChange = async (layouts: Layout[]) => {
    if (!customDashboard) return;
    await Promise.all(
      layouts.map(layout =>
        updateCustomDashboardWidgetLayout(customDashboard.custom_dashboard_id, layout.i, {
          widget_layout_h: layout.h,
          widget_layout_w: layout.w,
          widget_layout_x: layout.x,
          widget_layout_y: layout.y,
        }),
      ),
    );
    setCustomDashboard(prev => prev && {
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
      {!readOnly && <CustomDashboardHeader />}
      {/* Not perfect to use negative margin here, but I don't find a better solution to align items */}
      <div id="container" style={{ margin: theme.spacing(-2.5) }}>
        <ReactGridLayout
          className="layout"
          margin={[20, 20]}
          rowHeight={50}
          cols={12}
          draggableCancel=".noDrag"
          isDraggable={!readOnly}
          isResizable={!readOnly}
          onLayoutChange={onLayoutChange}
          onResizeStart={(_, { i }) => handleResize(i)}
          onResizeStop={() => handleResize(null)}
        >
          {customDashboard?.custom_dashboard_widgets?.map((widget) => {
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
                      paddingTop: theme.spacing(2.5),
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
                    {!readOnly && (
                      <WidgetPopover
                        className="noDrag"
                        customDashboardId={customDashboard.custom_dashboard_id}
                        widget={widget}
                        onUpdate={widget => handleWidgetUpdate(widget)}
                        onDelete={widgetId => handleWidgetDelete(widgetId)}
                      />
                    )}
                  </Box>
                </Box>
                <ErrorBoundary>
                  {widget.widget_id === idToResize ? (<div />) : (
                    <Box
                      flex={1}
                      display="flex"
                      flexDirection="column"
                      minHeight={0}
                      padding={theme.spacing(1, 2, 2, 2)}
                      overflow="auto"
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
        {!readOnly && customDashboard && (
          <WidgetCreation
            customDashboardId={customDashboard.custom_dashboard_id}
            widgets={customDashboard?.custom_dashboard_widgets ?? []}
            onCreate={widget => handleWidgetCreate(widget)}
          />
        )}
      </div>
    </div>
  );
};

export default CustomDashboardComponent;
