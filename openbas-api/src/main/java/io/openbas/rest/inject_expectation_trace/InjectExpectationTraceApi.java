package io.openbas.rest.inject_expectation_trace;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject_expectation_trace.form.InjectExpectationTraceInput;
import io.openbas.service.InjectExpectationTraceService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/inject-expectations-traces")
@PreAuthorize("isAdmin()")
public class InjectExpectationTraceApi extends RestBehavior {

  private final InjectExpectationTraceService injectExpectationTraceService;
  private final InjectExpectationRepository injectExpectationRepository;
  private final CollectorRepository collectorRepository;

  @PostMapping()
  public InjectExpectationTrace createInjectExpectationTrace(
      @Valid @RequestBody InjectExpectationTraceInput input) {
    InjectExpectationTrace injectExpectationTrace = new InjectExpectationTrace();
    injectExpectationTrace.setUpdateAttributes(input);
    injectExpectationTrace.setInjectExpectation(
        injectExpectationRepository
            .findById(input.getInjectExpectationId())
            .orElseThrow(() -> new ElementNotFoundException("Inject expectation not found")));
    injectExpectationTrace.setCollector(
        collectorRepository
            .findById(input.getCollectorId())
            .orElseThrow(() -> new ElementNotFoundException("Collector not found")));
    return this.injectExpectationTraceService.createInjectExpectationTrace(injectExpectationTrace);
  }

  @GetMapping()
  public List<InjectExpectationTrace> getInjectExpectationTracesByExpectationAndCollector(
      @RequestParam String injectExpectationId, @RequestParam String collectorId) {
    return this.injectExpectationTraceService.getInjectExpectationTracesByExpectationAndCollector(
        injectExpectationId, collectorId);
  }
}
