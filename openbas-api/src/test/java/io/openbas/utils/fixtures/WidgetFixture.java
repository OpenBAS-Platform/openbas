package io.openbas.utils.fixtures;

import static io.openbas.engine.api.WidgetType.VERTICAL_BAR_CHART;

import io.openbas.database.model.Filters;
import io.openbas.database.model.Widget;
import io.openbas.database.model.WidgetLayout;
import io.openbas.engine.api.DateHistogramWidget;
import io.openbas.engine.api.HistogramInterval;
import io.openbas.engine.api.ListConfiguration;
import io.openbas.engine.api.WidgetType;
import java.util.ArrayList;
import java.util.List;

public class WidgetFixture {

  public static final String NAME = "Widget 1";

  public static Widget createDefaultWidget() {
    Widget widget = new Widget();
    widget.setType(VERTICAL_BAR_CHART);
    DateHistogramWidget widgetConfig = new DateHistogramWidget();
    widgetConfig.setTitle(NAME);
    widgetConfig.setField("whatever");
    widgetConfig.setSeries(new ArrayList<>());
    widgetConfig.setInterval(HistogramInterval.day);
    widgetConfig.setStart("2012-12-21T10:45:23Z");
    widgetConfig.setEnd("2012-12-22T10:45:23Z");
    widget.setWidgetConfiguration(widgetConfig);
    WidgetLayout widgetLayout = new WidgetLayout();
    widget.setLayout(widgetLayout);
    return widget;
  }

  public static Widget createListWidgetWithEntity(String entityName) {
    Widget widget = new Widget();
    widget.setType(WidgetType.LIST);
    // series
    ListConfiguration.ListPerspective series = new ListConfiguration.ListPerspective();
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    filterGroup.setMode(Filters.FilterMode.and);
    Filters.Filter filter = new Filters.Filter();
    filter.setValues(List.of(entityName));
    filter.setOperator(Filters.FilterOperator.eq);
    filter.setMode(Filters.FilterMode.and);
    filter.setKey("base_entity");
    filterGroup.setFilters(List.of(filter));
    series.setFilter(filterGroup);
    // basic configuration
    ListConfiguration listConfiguration = new ListConfiguration();
    listConfiguration.setPerspective(series);
    widget.setWidgetConfiguration(listConfiguration);
    // basic layout
    widget.setLayout(new WidgetLayout());
    return widget;
  }
}
