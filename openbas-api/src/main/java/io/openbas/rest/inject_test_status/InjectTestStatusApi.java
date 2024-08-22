package io.openbas.rest.inject_test_status;

import io.openbas.database.model.InjectTestStatus;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.InjectTestStatusService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("isAdmin()")
@RequiredArgsConstructor
public class InjectTestStatusApi extends RestBehavior {

  private final InjectTestStatusService injectTestStatusService;

  @GetMapping("/api/injects/{injectId}/test")
  public InjectTestStatus testInject(@PathVariable @NotBlank String injectId) {
    return injectTestStatusService.testInject(injectId);
  }

  @PostMapping("/api/injects/bulk/test")
  public List<InjectTestStatus> bulkTestInjects(@RequestBody List<String> injectIds) {
    return injectTestStatusService.bulkTestInjects(injectIds);
  }

  @PostMapping("/api/exercise/{exerciseId}/injects/test")
  public Page<InjectTestStatus> findAllExerciseInjectTests(@PathVariable @NotBlank String exerciseId,
      @RequestBody @Valid
      SearchPaginationInput searchPaginationInput) {
    return injectTestStatusService.findAllInjectTestsByExerciseId(exerciseId, searchPaginationInput);
  }

  @PostMapping("/api/scenario/{scenarioId}/injects/test")
  public Page<InjectTestStatus> findAllScenarioInjectTests(@PathVariable @NotBlank String scenarioId,
      @RequestBody @Valid
      SearchPaginationInput searchPaginationInput) {
    return injectTestStatusService.findAllInjectTestsByScenarioId(scenarioId, searchPaginationInput);
  }

  @GetMapping("/api/injects/test/{testId}")
  public InjectTestStatus findInjectTestStatus(@PathVariable @NotBlank String testId) {
    return injectTestStatusService.findInjectTestStatusById(testId);
  }
}
