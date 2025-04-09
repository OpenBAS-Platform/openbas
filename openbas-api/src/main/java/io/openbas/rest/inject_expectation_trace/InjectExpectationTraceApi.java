package io.openbas.rest.inject_expectation_trace;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.Collector;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject_expectation_trace.form.InjectExpectationTraceInput;
import io.openbas.service.InjectExpectationTraceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping(InjectExpectationTraceApi.INJECT_EXPECTATION_TRACES_URI)
@PreAuthorize("isAdmin()")
@Log
public class InjectExpectationTraceApi extends RestBehavior {

  public static final String INJECT_EXPECTATION_TRACES_URI = "/api/inject-expectations-traces";

  private final InjectExpectationTraceService injectExpectationTraceService;
  private final InjectExpectationRepository injectExpectationRepository;
  private final CollectorRepository collectorRepository;

  /**
   * @deprecated since 1.16.0, forRemoval = true
   * @see #bulkInsertInjectExpectationTraceForCollector(List)
   */
  @Deprecated(
      since = "1.16.0",
      forRemoval = true)
    @Operation(summary = "Create inject expectation trace for collector. Deprecated since 1.16.0. Replaced by " + INJECT_EXPECTATION_TRACES_URI + "/bulk")
  @PostMapping()
  public InjectExpectationTrace createInjectExpectationTraceForCollector(
      @Valid @RequestBody InjectExpectationTraceInput input) {
    InjectExpectationTrace injectExpectationTrace = new InjectExpectationTrace();
    injectExpectationTrace.setUpdateAttributes(input);
    injectExpectationTrace.setInjectExpectation(
        injectExpectationRepository
            .findById(input.getInjectExpectationId())
            .orElseThrow(() -> new ElementNotFoundException("Inject expectation not found")));
    Collector collector =
        collectorRepository
            .findById(input.getSourceId())
            .orElseThrow(() -> new ElementNotFoundException("Collector not found"));
    injectExpectationTrace.setSecurityPlatform(collector.getSecurityPlatform());
    return this.injectExpectationTraceService.createInjectExpectationTrace(injectExpectationTrace);
  }

  /**
   * Bulk insert inject expectation traces for a collector.
   *
   * @param inputs the list of inject expectation trace inputs to be inserted
   */
  @Operation(summary = "Bulk insert inject expectation traces")
  @ApiResponses(value = {
          @ApiResponse(
                  responseCode = "200",
                  description = "Inject expectation traces inserted successfully"
          )
  })
  @LogExecutionTime
  @PostMapping("/bulk")
  public void bulkInsertInjectExpectationTraceForCollector(
          @Valid @RequestBody List<InjectExpectationTraceInput> inputs) {
      Instant start = Instant.now();
      if (inputs.isEmpty()) {
          return;
      }
      // Convert the input list to InjectExpectationTrace objects and extract oldest trace's date
      // Start by getting the collector. We can take the first one since they are all the same
      Collector collector = collectorRepository.findById(inputs.getFirst().getSourceId()).orElseThrow(() -> new ElementNotFoundException("Collector not found"));
      final AtomicReference<Instant> oldestAlertDate = new AtomicReference<>(Instant.now());
      List<InjectExpectationTrace> traces = inputs.stream()
            .map(input -> {
              // Compute oldest date
              if (input.getAlertDate().isBefore(oldestAlertDate.get())) {
                oldestAlertDate.set(input.getAlertDate());
              }
              // Convert input to InjectExpectationTrace
              InjectExpectationTrace trace = new InjectExpectationTrace();
              trace.setUpdateAttributes(input);
              trace.setSecurityPlatform(collector.getSecurityPlatform());
              // We don't need to fetch the actual expectation here, we can just set the id as there is no cascade
              trace.setInjectExpectation(new InjectExpectation());
              trace.getInjectExpectation().setId(input.getInjectExpectationId());
              return trace;
            }).toList();
      this.injectExpectationTraceService.bulkInsertInjectExpectationTraces(traces, oldestAlertDate.get());
      Instant afterSelect  = Instant.now();
      log.warning("It took " + Duration.between(start, afterSelect).toMillis() + " ms to handle " + inputs.size() + " traces");
  }

  @Operation(summary = "Get inject expectation traces from collector")
  @GetMapping()
  public List<InjectExpectationTrace> getInjectExpectationTracesFromCollector(
      @RequestParam String injectExpectationId, @RequestParam String sourceId) {
    Collector collector =
        collectorRepository
            .findById(sourceId)
            .orElseThrow(() -> new ElementNotFoundException("Collector not found"));
    return this.injectExpectationTraceService.getInjectExpectationTracesFromCollector(
        injectExpectationId, collector.getSecurityPlatform().getId());
  }

  @Operation(summary = "Get inject expectation traces' count")
  @GetMapping("/count")
  public long getAlertLinksNumber(
      @RequestParam String injectExpectationId,
      @RequestParam String sourceId,
      @RequestParam String expectationResultSourceType) {
    return this.injectExpectationTraceService.getAlertLinksNumber(
        injectExpectationId, sourceId, expectationResultSourceType);
  }
}
