package io.openbas.service;

import io.openbas.database.model.Collector;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.model.SecurityPlatform;
import io.openbas.database.raw.impl.SimpleRawExpectationTrace;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.database.repository.InjectExpectationTraceRepository;
import io.openbas.database.repository.SecurityPlatformRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject_expectation_trace.form.InjectExpectationTraceInput;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log
@RequiredArgsConstructor
public class InjectExpectationTraceService {

  private final InjectExpectationTraceRepository injectExpectationTraceRepository;
  private final SecurityPlatformRepository securityPlatformRepository;
  private final CollectorRepository collectorRepository;

  private static final String COLLECTOR_TYPE = "collector";

  public InjectExpectationTrace createInjectExpectationTrace(
      @NotNull InjectExpectationTrace injectExpectationTrace) {
    Optional<InjectExpectationTrace> existingTrace =
        this.injectExpectationTraceRepository
            .findByAlertLinkAndAlertNameAndSecurityPlatformAndInjectExpectation(
                injectExpectationTrace.getAlertLink(),
                injectExpectationTrace.getAlertName(),
                injectExpectationTrace.getSecurityPlatform(),
                injectExpectationTrace.getInjectExpectation());
    if (existingTrace.isPresent()) {
      log.info("Existing trace present, no creation");
      return existingTrace.get();
    } else {
      return this.injectExpectationTraceRepository.save(injectExpectationTrace);
    }
  }

  public List<InjectExpectationTrace> getInjectExpectationTracesFromCollector(
      @NotNull String injectExpectationId, @NotNull String sourceId) {
    return this.injectExpectationTraceRepository.findByExpectationAndSecurityPlatform(
        injectExpectationId, sourceId);
  }

  public long getAlertLinksNumber(
      @NotNull String injectExpectationId,
      @NotNull String sourceId,
      String expectationResultSourceType) {
    if (expectationResultSourceType.equalsIgnoreCase(COLLECTOR_TYPE)) {
      SecurityPlatform securityPlatform =
          securityPlatformRepository
              .findByExternalReference(sourceId)
              .orElseThrow(() -> new ElementNotFoundException("Security platform not found"));
      return this.injectExpectationTraceRepository.countAlerts(
          injectExpectationId, securityPlatform.getId());
    } else {
      return this.injectExpectationTraceRepository.countAlerts(injectExpectationId, sourceId);
    }
  }

  @Transactional(rollbackFor = Exception.class)
  public void bulkInsertInjectExpectationTraces(
      @NotNull List<InjectExpectationTraceInput> injectExpectationTraces) {
    // We start by deduplicating the data, to avoid duplicates in the database
    // Convert the input list to InjectExpectationTrace objects and extract oldest trace's date
    // Start by getting the collector. We can take the first one since they are all the same
    Collector collector =
        collectorRepository
            .findById(injectExpectationTraces.getFirst().getSourceId())
            .orElseThrow(() -> new ElementNotFoundException("Collector not found"));
    final AtomicReference<Instant> oldestAlertDate = new AtomicReference<>(Instant.now());
    Map<SimpleRawExpectationTrace, InjectExpectationTrace> traces = new HashMap<>();
    injectExpectationTraces.forEach(
        input -> {
          // Compute oldest date
          if (input.getAlertDate().isBefore(oldestAlertDate.get())) {
            oldestAlertDate.set(input.getAlertDate());
          }
          // Convert input to InjectExpectationTrace
          InjectExpectationTrace trace = new InjectExpectationTrace();
          trace.setUpdateAttributes(input);
          trace.setSecurityPlatform(collector.getSecurityPlatform());
          // We don't need to fetch the actual expectation here, we can just set the id as there is
          // no cascade
          trace.setInjectExpectation(new InjectExpectation());
          trace.getInjectExpectation().setId(input.getInjectExpectationId());

          SimpleRawExpectationTrace simpleTrace = SimpleRawExpectationTrace.of(trace);

          traces.computeIfAbsent(simpleTrace, k -> trace);
        });

    // Dedupe from DB
    List<SimpleRawExpectationTrace> rawsfromDB1 =
        this.injectExpectationTraceRepository.findAllTracesNewerThan(
            oldestAlertDate.get().truncatedTo(ChronoUnit.SECONDS));
    Set<SimpleRawExpectationTrace> fromDB = new HashSet<>(rawsfromDB1);

    // Removing duplicate traces
    traces.keySet().removeAll(fromDB);

    // Save the remaining traces
    this.injectExpectationTraceRepository.saveAll(traces.values());
  }
}
