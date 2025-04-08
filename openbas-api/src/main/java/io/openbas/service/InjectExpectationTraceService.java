package io.openbas.service;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.model.SecurityPlatform;
import io.openbas.database.repository.InjectExpectationTraceRepository;
import io.openbas.database.repository.SecurityPlatformRepository;
import io.openbas.database.specification.InjectExpectationSpecification;
import io.openbas.database.specification.InjectExpectationTracesSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Service
@Log
@RequiredArgsConstructor
public class InjectExpectationTraceService {

  private final InjectExpectationTraceRepository injectExpectationTraceRepository;
  private final SecurityPlatformRepository securityPlatformRepository;

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

  public void bulkInsertInjectExpectationTraces(
          @NotNull List<InjectExpectationTrace> injectExpectationTraces,
          Instant deduplicationTimeStamp) {
    // Deduplication from the list first
    List<InjectExpectationTrace> deduped = new ArrayList<>(injectExpectationTraces);
    // Dedupe from DB
    Instant start = Instant.now();
    //List<InjectExpectationTrace> fromDB = this.injectExpectationTraceRepository.findAll(InjectExpectationTracesSpecification.afterAlertDate(deduplicationTimeStamp));
    List<InjectExpectationTrace> fromDB = this.injectExpectationTraceRepository.findAll(InjectExpectationTracesSpecification.afterAlertDate(Instant.now().plus(Duration.ofHours(2)).minus(Duration.ofMinutes(1))));
    Instant afterSelect  = Instant.now();
    log.warning("It took " + Duration.between(start, afterSelect).toMillis() + " ms to fetch " + fromDB.size() + " traces");
    fromDB.forEach(injectExpectationTrace -> {
        // Remove the trace from the list if it exists in the DB
        deduped.removeIf(trace -> trace.equalsExcludingId(injectExpectationTrace));
    });
    Instant afterDeduplication = Instant.now();
    log.warning("It took " + Duration.between(afterSelect, afterDeduplication).toMillis() + " ms to dedupe " + deduped.size() + " traces");

    // Save the remaining traces
    this.injectExpectationTraceRepository.saveAll(deduped);
    Instant finish = Instant.now();
    log.warning("It took " + Duration.between(afterDeduplication, finish).toMillis() + " ms to save " + deduped.size() + " traces");
  }
}
