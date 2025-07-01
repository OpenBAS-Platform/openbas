package io.openbas.rest.dashboard;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.Widget;
import io.openbas.engine.model.EsBase;
import io.openbas.engine.model.EsSearch;
import io.openbas.engine.query.EsSeries;
import io.openbas.rest.custom_dashboard.WidgetService;
import io.openbas.rest.helper.RestBehavior;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class DashboardApi extends RestBehavior {

  public static final String DASHBOARD_URI = "/api/dashboards";

  private final WidgetService widgetService;
  private final DashboardService dashboardService;

  @GetMapping(DASHBOARD_URI + "/count/{type}")
  public long count(@PathVariable String type) {
    return this.dashboardService.count(type);
  }

  @GetMapping(DASHBOARD_URI + "/series/{widgetId}")
  public List<EsSeries> series(@PathVariable final String widgetId) {
    Widget widget = this.widgetService.widget(widgetId);
    CustomDashboard customDashboard = widget.getCustomDashboard();
    Map<String, String> parameters = customDashboard.toParametersMap();
    return this.dashboardService.series(widget, parameters);
  }

  @GetMapping(DASHBOARD_URI + "/entities/{widgetId}")
  public List<EsBase> entities(@PathVariable final String widgetId) {
    Widget widget = this.widgetService.widget(widgetId);
    return this.dashboardService.entities(widget);
  }

  @GetMapping(DASHBOARD_URI + "/search/{search}")
  public List<EsSearch> search(@PathVariable final String search) {
    return this.dashboardService.search(search);
  }
}
