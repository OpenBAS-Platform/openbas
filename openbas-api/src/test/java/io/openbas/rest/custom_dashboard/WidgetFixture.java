package io.openbas.rest.custom_dashboard;

import io.openbas.database.model.Widget;
import io.openbas.database.model.WidgetParameters;

import static io.openbas.database.model.Widget.WidgetType.VERTICAL_BAR_CHART;

public class WidgetFixture {

  public static final String NAME = "Widget 1";

  public static Widget createDefaultWidget() {
    Widget widget = new Widget();
    widget.setType(VERTICAL_BAR_CHART);
    WidgetParameters widgetParameters = new WidgetParameters();
    widgetParameters.setTitle(NAME);
    widget.setParameters(widgetParameters);
    return widget;
  }
}
