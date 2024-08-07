package io.openbas.rest.inject_test_status;

import io.openbas.database.model.InjectTestStatus;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.InjectTestStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inject_test_status")
@PreAuthorize("isAdmin()")
@RequiredArgsConstructor
public class InjectTestStatusApi extends RestBehavior {

  private final InjectTestStatusService injectTestStatusService;

  @GetMapping("/test/{injectId}")
  public InjectTestStatus testInject(@PathVariable String injectId) {
    return injectTestStatusService.testInject(injectId);
  }

  @GetMapping("/exercise/{exerciseId}")
  public List<InjectTestStatus> findAllExerciseInjectTests(@PathVariable String exerciseId) {
    return injectTestStatusService.findAllExerciseInjectTests(exerciseId);
  }

  @GetMapping("/scenario/{scenarioId}")
  public List<InjectTestStatus> findAllScenarioInjectTests(@PathVariable String scenarioId) {
    return injectTestStatusService.findAllScenarioInjectTests(scenarioId);
  }

  @GetMapping("/{testId}")
  public InjectTestStatus findInjectTestStatus(@PathVariable String testId) {
    return injectTestStatusService.findInjectTestStatus(testId);
  }
}
