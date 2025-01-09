package io.openbas.rest.inject_test_status;

import static io.openbas.database.specification.InjectSpecification.testable;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTestStatus;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectBulkProcessingInput;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.service.InjectTestStatusService;
import io.openbas.telemetry.Tracing;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@PreAuthorize("isAdmin()")
@RequiredArgsConstructor
public class InjectTestStatusApi extends RestBehavior {

  private final InjectTestStatusService injectTestStatusService;
  private final InjectService injectService;

  @Transactional(rollbackFor = Exception.class)
  @GetMapping("/api/injects/{injectId}/test")
  public InjectTestStatus testInject(@PathVariable @NotBlank String injectId) {
    return injectTestStatusService.testInject(injectId);
  }

  @Transactional(rollbackFor = Exception.class)
  @GetMapping("/api/injects/test/{testId}")
  public InjectTestStatus findInjectTestStatus(@PathVariable @NotBlank String testId) {
    return injectTestStatusService.findInjectTestStatusById(testId);
  }

  @Transactional(rollbackFor = Exception.class)
  @DeleteMapping("/api/injects/test/{testId}")
  public void deleteInjectTest(@PathVariable String testId) {
    injectTestStatusService.deleteInjectTest(testId);
  }

  @Operation(
      description = "Bulk tests of injects",
      tags = {"Injects", "Tests"})
  @Transactional(rollbackFor = Exception.class)
  @PostMapping("/api/injects/test")
  @LogExecutionTime
  @Tracing(name = "Bulk tests of injects", layer = "api", operation = "PUT")
  public List<InjectTestStatus> bulkTestInject(
      @RequestBody @Valid final InjectBulkProcessingInput input) {

    // Control and format inputs
    if (CollectionUtils.isEmpty(input.getInjectIDsToProcess())
        && input.getSearchPaginationInput() == null) {
      throw new BadRequestException(
          "Either search_pagination_input or inject_ids_to_process must be provided");
    }

    // Specification building
    Specification<Inject> filterSpecifications =
        this.injectService.getInjectSpecification(input).and(testable());

    // Services calls
    // Bulk test
    return injectTestStatusService.bulkTestInjects(filterSpecifications);
  }
}
