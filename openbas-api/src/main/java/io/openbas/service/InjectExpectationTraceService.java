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
            .findByAlertLinkAndAlertNameAndSecurityPlatformAndInjectExpectation(
                injectExpectationTrace.getAlertLink(),
                injectExpectationTrace.getAlertName(),
                injectExpectationTrace.getSecurityPlatform(),
                injectExpectationTrace.getInjectExpectation());
    return existingTrace.orElseGet(
        () -> this.injectExpectationTraceRepository.save(injectExpectationTrace));
  }

  public List<InjectExpectationTrace> getInjectExpectationTracesFromCollector(
      @NotNull String injectExpectationId, @NotNull String sourceId) {
    return this.injectExpectationTraceRepository.findByExpectationAndSecurityPlatform(
        injectExpectationId, sourceId);
  }

  public long getAlertLinksNumber(@NotNull String injectExpectationId, @NotNull String sourceId) {
    return this.injectExpectationTraceRepository.countAlerts(injectExpectationId, sourceId);
  }
}
