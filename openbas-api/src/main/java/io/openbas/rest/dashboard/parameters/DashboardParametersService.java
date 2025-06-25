package io.openbas.rest.dashboard.parameters;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.repository.CustomDashboardRepository;
import io.openbas.rest.custom_dashboard.CustomDashboardService;
import io.openbas.rest.dashboard.parameters.model.DashboardParameters;
import io.openbas.rest.dashboard.parameters.model.DashboardParametersInput;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class DashboardParametersService {

  public static final String SIMULATION_PARAM_UUID = "0e1f05c4-1234-4bce-a807-52d267c423f9";

  private final CustomDashboardRepository customDashboardRepository;

  // -- CRUD --

  public List<DashboardParameters> getParameters() {
    return List.of(
        build(SIMULATION_PARAM_UUID, "Simulation", "simulation")
    );
  }

  @Transactional
  public CustomDashboard updateParameters(
      @NotNull final CustomDashboard customDashboard,
      @NotNull final DashboardParametersInput input) {
    Map<String, String> parameters = customDashboard.getParameters();
    if (parameters == null) {
      parameters = new HashMap<>();
    }
    parameters.put(input.getId(), input.getValue());
    customDashboard.setParameters(parameters);
    return this.customDashboardRepository.save(customDashboard);
  }

  // -- UTILS --

  private DashboardParameters build(
      @NotBlank final String id,
      @NotBlank final String name,
      @NotBlank final String type) {
    DashboardParameters p = new DashboardParameters();
    p.setId(id);
    p.setName(name);
    p.setType(type);
    return p;
  }

}
