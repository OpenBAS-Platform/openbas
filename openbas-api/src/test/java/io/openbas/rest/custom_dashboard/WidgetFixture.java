package io.openbas.rest.custom_dashboard;

import static io.openbas.engine.api.WidgetType.VERTICAL_BAR_CHART;

import io.openbas.database.model.Widget;
import io.openbas.database.model.WidgetLayout;
import io.openbas.engine.api.DateHistogramWidget;

public class WidgetFixture {

  public static final String NAME = "Widget 1";

  public static Widget createDefaultWidget() {
    Widget widget = new Widget();
    widget.setType(VERTICAL_BAR_CHART);
    DateHistogramWidget widgetConfig = new DateHistogramWidget();
    widgetConfig.setTitle(NAME);
    widget.setWidgetConfiguration(widgetConfig);
    WidgetLayout widgetLayout = new WidgetLayout();
    widget.setLayout(widgetLayout);
    return widget;
  }
}
