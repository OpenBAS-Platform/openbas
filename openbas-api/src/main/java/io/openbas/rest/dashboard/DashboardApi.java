package io.openbas.rest.dashboard;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.aop.RBAC;
import io.openbas.database.model.*;
import io.openbas.engine.model.EsBase;
import io.openbas.engine.model.EsSearch;
import io.openbas.engine.query.EsAttackPath;
import io.openbas.engine.query.EsSeries;
import io.openbas.rest.helper.RestBehavior;
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

  private final DashboardService dashboardService;

  @PostMapping(DASHBOARD_URI + "/count/{widgetId}")
  @RBAC(
      resourceId = "#widgetId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.DASHBOARD)
  public long count(
      @PathVariable final String widgetId,
      @RequestBody(required = false) Map<String, String> parameters) {
    return this.dashboardService.count(widgetId, parameters);
  }

  @PostMapping(DASHBOARD_URI + "/series/{widgetId}")
  @RBAC(
      resourceId = "#widgetId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.DASHBOARD)
  public List<EsSeries> series(
      @PathVariable final String widgetId,
      @RequestBody(required = false) Map<String, String> parameters) {
    return this.dashboardService.series(widgetId, parameters);
  }

  @PostMapping(DASHBOARD_URI + "/entities/{widgetId}")
  @RBAC(
      resourceId = "#widgetId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.DASHBOARD)
  public List<EsBase> entities(
      @PathVariable final String widgetId,
      @RequestBody(required = false) Map<String, String> parameters) {
    return this.dashboardService.entities(widgetId, parameters);
  }

  @PostMapping(DASHBOARD_URI + "/attack-paths/{widgetId}")
  @RBAC(
      resourceId = "#widgetId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.DASHBOARD)
  public List<EsAttackPath> attackPaths(
      @PathVariable final String widgetId,
      @RequestBody(required = false) Map<String, String> parameters)
      throws ExecutionException, InterruptedException {
    return this.dashboardService.attackPaths(widgetId, parameters);
  }

  @GetMapping(DASHBOARD_URI + "/search/{search}")
  @RBAC(actionPerformed = Action.SEARCH, resourceType = ResourceType.DASHBOARD)
  public List<EsSearch> search(@PathVariable final String search) {
    return this.dashboardService.search(search);
  }
}
