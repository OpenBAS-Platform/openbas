package io.openbas.rest.inject;

import io.openbas.database.model.InjectTestStatus;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.output.InjectOutput;
import io.openbas.service.InjectService;
import io.openbas.service.InjectTestStatusService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

@RestController
@RequiredArgsConstructor
public class ScenarioInjectApi extends RestBehavior {

  private final InjectService injectService;

  private final InjectTestStatusService injectTestStatusService;

  @GetMapping(SCENARIO_URI + "/{scenarioId}/injects/simple")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  @Transactional(readOnly = true)
  public Iterable<InjectOutput> scenarioInjectsSimple(@PathVariable @NotBlank final String scenarioId) {
    return injectService.injects(InjectSpecification.fromScenario(scenarioId));
  }

  @DeleteMapping(SCENARIO_URI + "/{scenarioId}/injects")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public void deleteListOfInjectsForScenario(@PathVariable final String scenarioId,
      @RequestBody List<String> injectIds) {
    injectService.deleteAllByIds(injectIds);
  }

  @PostMapping("/api/scenario/{scenarioId}/injects/test")
  public Page<InjectTestStatus> findAllScenarioInjectTests(@PathVariable @NotBlank String scenarioId,
      @RequestBody @Valid
      SearchPaginationInput searchPaginationInput) {
    return injectTestStatusService.findAllInjectTestsByScenarioId(scenarioId, searchPaginationInput);
  }

}
