package io.openbas.rest.dashboard.parameters;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.rest.dashboard.DashboardApi.DASHBOARD_URI;

import io.openbas.database.model.CustomDashboard;
import io.openbas.rest.custom_dashboard.CustomDashboardService;
import io.openbas.rest.dashboard.parameters.model.DashboardParameters;
import io.openbas.rest.dashboard.parameters.model.DashboardParametersInput;
import io.openbas.rest.helper.RestBehavior;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RequestMapping(DASHBOARD_URI + "/parameters")
@RestController
@RequiredArgsConstructor
@Secured(ROLE_USER)
public class DashboardParametersApi extends RestBehavior {

  private final DashboardParametersService dashboardParametersService;
  private final CustomDashboardService customDashboardService;

  @GetMapping
  public List<DashboardParameters> getParameters() {
    return this.dashboardParametersService.getParameters();
  }

  @PutMapping("/{customDashboardId}")
  public ResponseEntity<CustomDashboard> updateParameters(
      @PathVariable @NotBlank final String customDashboardId,
      @RequestBody @Valid @NotNull final DashboardParametersInput input) {
    CustomDashboard existingCustomDashboard =
        this.customDashboardService.customDashboard(customDashboardId);
    return ResponseEntity.ok(
        this.dashboardParametersService.updateParameters(existingCustomDashboard, input));
  }
}
