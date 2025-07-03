package io.openbas.rest.dashboard;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.database.model.Widget;
import io.openbas.engine.model.EsBase;
import io.openbas.engine.model.EsSearch;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.UserRepository;
import io.openbas.engine.api.*;
import io.openbas.engine.model.*;
import io.openbas.engine.query.EsAttackPath;
import io.openbas.engine.query.EsSeries;
import io.openbas.rest.custom_dashboard.WidgetService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.EsAttackPathService;
import io.openbas.service.EsService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class DashboardApi extends RestBehavior {

  public static final String DASHBOARD_URI = "/api/dashboards";

  private final WidgetService widgetService;
  private final DashboardService dashboardService;
  private final EsAttackPathService esAttackPathService;
  private final UserRepository userRepository;

  @PostMapping(DASHBOARD_URI + "/series/{widgetId}")
  public List<EsSeries> series(
      @PathVariable final String widgetId,
      @RequestBody(required = false) Map<String, String> parameters) {
    if (parameters == null) {
      parameters = Map.of();
    }
    Widget widget = this.widgetService.widget(widgetId);
    CustomDashboard customDashboard = widget.getCustomDashboard();
    Map<String, CustomDashboardParameters> definitionParameters = customDashboard.toParametersMap();
    return this.dashboardService.series(widget, parameters, definitionParameters);
  }

  @PostMapping(DASHBOARD_URI + "/entities/{widgetId}")
  public List<EsBase> entities(
      @PathVariable final String widgetId,
      @RequestBody(required = false) Map<String, String> parameters) {
    if (parameters == null) {
      parameters = Map.of();
    }
    Widget widget = this.widgetService.widget(widgetId);
    CustomDashboard customDashboard = widget.getCustomDashboard();
    Map<String, CustomDashboardParameters> definitionParameters = customDashboard.toParametersMap();
    return this.dashboardService.entities(widget, parameters, definitionParameters);
  }

  @GetMapping(DASHBOARD_URI + "/attack-paths/{widgetId}")
  public List<EsAttackPath> attackPaths(@PathVariable final String widgetId)
      throws ExecutionException, InterruptedException {
    Widget widget = this.widgetService.widget(widgetId);
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());

    StructuralHistogramWidget config = (StructuralHistogramWidget) widget.getWidgetConfiguration();
    StructuralHistogramRuntime runtime = new StructuralHistogramRuntime(config);

    return esAttackPathService.attackPaths(userWithAuth, runtime);
  }

  @GetMapping(DASHBOARD_URI + "/search/{search}")
  public List<EsSearch> search(@PathVariable final String search) {
    return this.dashboardService.search(search);
  }
}
