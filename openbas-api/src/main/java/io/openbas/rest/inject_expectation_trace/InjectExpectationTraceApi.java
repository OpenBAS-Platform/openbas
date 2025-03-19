package io.openbas.rest.inject_expectation_trace;

import io.openbas.database.model.Collector;
import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.SecurityPlatformRepository;
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
  private final SecurityPlatformRepository securityPlatformRepository;

  @PostMapping()
  public InjectExpectationTrace createInjectExpectationTraceForCollector(
      @Valid @RequestBody InjectExpectationTraceInput input) {
    InjectExpectationTrace injectExpectationTrace = new InjectExpectationTrace();
    injectExpectationTrace.setUpdateAttributes(input);
    injectExpectationTrace.setInjectExpectation(
        injectExpectationRepository
            .findById(input.getInjectExpectationId())
            .orElseThrow(() -> new ElementNotFoundException("Inject expectation not found")));
    Collector collector = collectorRepository.findById(input.getSourceId())
        .orElseThrow(() -> new ElementNotFoundException("Collector not found"));
    injectExpectationTrace.setSecurityPlatform(collector.getSecurityPlatform());
    return this.injectExpectationTraceService.createInjectExpectationTrace(injectExpectationTrace);
  }

  @GetMapping()
  public List<InjectExpectationTrace> getInjectExpectationTracesFromCollector(
      @RequestParam String injectExpectationId, @RequestParam String sourceId) {
    Collector collector = collectorRepository.findById(sourceId)
        .orElseThrow(() -> new ElementNotFoundException("Collector not found"));
    return this.injectExpectationTraceService.getInjectExpectationTracesFromCollector(
        injectExpectationId, collector.getSecurityPlatform().getId());
  }


}
