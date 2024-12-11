package io.openbas.rest.scenario;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.scenario.response.ScenarioStatistic;
import io.openbas.rest.scenario.service.ScenarioStatisticService;
import io.openbas.telemetry.Tracing;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class ScenarioStatisticApi extends RestBehavior {

  private final ScenarioStatisticService scenarioStatisticService;

  @GetMapping(SCENARIO_URI + "/{scenarioId}/statistics")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  @Transactional(rollbackOn = Exception.class)
  @Operation(summary = "Retrieve scenario statistics")
  @Tracing(name = "Get scenario statistics", layer = "api", operation = "GET")
  public ScenarioStatistic getScenarioStatistics(@PathVariable @NotBlank final String scenarioId) {
    return scenarioStatisticService.getStatistics(scenarioId);
  }
}
