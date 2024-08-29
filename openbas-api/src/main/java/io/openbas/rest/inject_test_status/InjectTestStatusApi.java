package io.openbas.rest.inject_test_status;

import io.openbas.database.model.InjectTestStatus;
import io.openbas.database.repository.InjectTestStatusRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.InjectTestStatusService;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
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

  @GetMapping("/api/injects/test/{testId}")
  public InjectTestStatus findInjectTestStatus(@PathVariable @NotBlank String testId) {
    return injectTestStatusService.findInjectTestStatusById(testId);
  }

  @Transactional(rollbackOn = Exception.class)
  @DeleteMapping("/api/injects/test/{testId}")
  public void deleteInjectTest(@PathVariable String testId) {
    injectTestStatusService.deleteInjectTest(testId);
  }

}
