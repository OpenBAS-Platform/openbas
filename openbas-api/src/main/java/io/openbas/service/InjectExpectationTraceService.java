package io.openbas.service;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.model.SecurityPlatform;
import io.openbas.database.repository.InjectExpectationTraceRepository;
import io.openbas.database.repository.SecurityPlatformRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

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
  private static final String COLLECTOR_TYPE = "collector";

  ScheduledFuture<?> scheduledTask = null;
  List<InjectExpectationTrace> callbacksWaiting = new ArrayList<>();

  private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(20);

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

  public void batchInsertInjectExecutionTracesCallback(InjectExpectationTrace input) {
    boolean findDupe = callbacksWaiting.stream().anyMatch(injectExpectationTrace ->
                    injectExpectationTrace.getInjectExpectation().equals(input.getInjectExpectation())
                            && injectExpectationTrace.getSecurityPlatform().equals(input.getSecurityPlatform())
                            && injectExpectationTrace.getAlertLink().equals(input.getAlertLink())
                            && injectExpectationTrace.getAlertName().equals(input.getAlertName()));
    if (findDupe) {
      return;
    }
    callbacksWaiting.add(input);
    if(callbacksWaiting.size() > 1000) {
      executorService.submit(() -> {
        scheduledTask.cancel(false);
        List<InjectExpectationTrace> callbacks = new ArrayList<>(callbacksWaiting);
        callbacksWaiting.clear();
        scheduledTask = null;
        try {
          bulkCreateInjectExpectationTrace(callbacks);
        } catch (RuntimeException e) {
          log.severe(e.getMessage());
        } finally {
          Thread.currentThread().interrupt();
        }
      });
    } else {
      if(scheduledTask == null) {
        scheduledTask = executorService.schedule(() -> {
          List<InjectExpectationTrace> callbacks = new ArrayList<>(callbacksWaiting);
          callbacksWaiting.clear();
          scheduledTask = null;
          try {
            bulkCreateInjectExpectationTrace(callbacks);
          } catch (RuntimeException e) {
            log.severe(e.getMessage());
          } finally {
            Thread.currentThread().interrupt();
          }
        }, 10, TimeUnit.SECONDS);
      }
      callbacksWaiting.add(input);
    }
  }

  public void bulkCreateInjectExpectationTrace(
          @NotNull List<InjectExpectationTrace> injectExpectationTraces) {
    List<InjectExpectationTrace> existingTraces = this.injectExpectationTraceRepository.findAll((root, query, criteriaBuilder) -> criteriaBuilder.and(
            criteriaBuilder.lessThanOrEqualTo(root.get("dateCreated"), Date.from(Instant.now().minus(45, ChronoUnit.MINUTES)))
    ));

    List<InjectExpectationTrace> tracesToInsert = injectExpectationTraces.stream()
            .distinct()
            .filter(injectExpectationTrace -> !existingTraces.contains(injectExpectationTrace))
            .toList();

      this.injectExpectationTraceRepository.saveAll(tracesToInsert);
//    }
  }
}
