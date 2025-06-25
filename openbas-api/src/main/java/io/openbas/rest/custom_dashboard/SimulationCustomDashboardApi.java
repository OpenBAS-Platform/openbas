package io.openbas.rest.custom_dashboard;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.Widget;
import io.openbas.engine.query.EsSeries;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.simulation.SimulationApi;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping(SimulationApi.SIMULATION_URI)
@RestController
@RequiredArgsConstructor
@Secured(ROLE_USER)
public class SimulationCustomDashboardApi extends RestBehavior {

  private final SimulationCustomDashboardService simulationCustomDashboardService;
  private final WidgetService widgetService;

  @GetMapping("/{simulationId}/custom-dashboards/{customDashboardId}")
  public ResponseEntity<CustomDashboard> customDashboard(
      @PathVariable @NotBlank final String simulationId,
      @PathVariable @NotBlank final String customDashboardId) {
    return ResponseEntity.ok(
        this.simulationCustomDashboardService.customDashboardForSimulation(
            simulationId, customDashboardId));
  }

  @GetMapping("/{simulationId}/series/{widgetId}")
  public ResponseEntity<List<EsSeries>> series(
      @PathVariable @NotBlank final String simulationId,
      @PathVariable @NotBlank final String widgetId) {
    Widget widget = this.widgetService.widget(widgetId);
    return ResponseEntity.ok(
        this.simulationCustomDashboardService.seriesForSimulation(simulationId, widget));
  }
}
