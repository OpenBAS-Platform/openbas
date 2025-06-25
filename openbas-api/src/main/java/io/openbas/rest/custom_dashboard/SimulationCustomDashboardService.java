package io.openbas.rest.custom_dashboard;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Widget;
import io.openbas.engine.query.EsSeries;
import io.openbas.rest.dashboard.DashboardService;
import io.openbas.rest.exercise.service.ExerciseService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SimulationCustomDashboardService {

  private final CustomDashboardService customDashboardService;
  private final DashboardService dashboardService;
  private final ExerciseService exerciseService;

  @Transactional(readOnly = true)
  public CustomDashboard customDashboardForSimulation(
      @NotNull final String simulationId, @NotNull final String customDashboardId) {
    Exercise simulation = this.exerciseService.exercise(simulationId);
    CustomDashboard customDashboard =
        this.customDashboardService.customDashboard(customDashboardId);

    this.parametersForSimulation(simulation, customDashboard);

    return customDashboard;
  }

  @Transactional(readOnly = true)
  public List<EsSeries> seriesForSimulation(
      @NotNull final String simulationId, @NotNull final Widget widget) {
    Exercise simulation = this.exerciseService.exercise(simulationId);
    CustomDashboard customDashboard = widget.getCustomDashboard();

    this.parametersForSimulation(simulation, customDashboard);

    return this.dashboardService.series(widget, customDashboard.toParametersMap());
  }

  // -- UTILS --

  private void parametersForSimulation(
      @NotNull final Exercise simulation, @NotNull final CustomDashboard customDashboard) {
    List<CustomDashboardParameters> parameters = new ArrayList<>();
    customDashboard
        .getParameters()
        .forEach(
            parameter -> {
              if (CustomDashboardParameters.CustomDashboardParameterType.simulation.equals(
                  parameter.getType())) {
                parameter.setValue(simulation.getId());
                parameters.add(parameter);
              } else {
                parameters.add(parameter);
              }
            });
    customDashboard.setParameters(parameters);
  }
}
