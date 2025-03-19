package io.openbas.service;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.repository.InjectExpectationTraceRepository;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InjectExpectationTraceService {

  private final InjectExpectationTraceRepository injectExpectationTraceRepository;

  public InjectExpectationTrace createInjectExpectationTrace(
      @NotNull InjectExpectationTrace injectExpectationTrace) {
    Optional<InjectExpectationTrace> existingTrace =
        this.injectExpectationTraceRepository
            .findByAlertDateAndAlertLinkAndAlertNameAndCollectorAndInjectExpectation(
                injectExpectationTrace.getAlertDate(),
                injectExpectationTrace.getAlertLink(),
                injectExpectationTrace.getAlertName(),
                injectExpectationTrace.getCollector(),
                injectExpectationTrace.getInjectExpectation());
    return existingTrace.orElseGet(
        () -> this.injectExpectationTraceRepository.save(injectExpectationTrace));
  }

  public List<InjectExpectationTrace> getInjectExpectationTracesByExpectationAndCollector(
      @NotNull String injectExpectationId, @NotNull String collectorId) {
    return this.injectExpectationTraceRepository.findByExpectationAndCollector(
        injectExpectationId, collectorId);
  }
}
