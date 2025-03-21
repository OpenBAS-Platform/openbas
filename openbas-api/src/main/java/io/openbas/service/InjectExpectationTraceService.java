package io.openbas.service;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.model.SecurityPlatform;
import io.openbas.database.repository.InjectExpectationTraceRepository;
import io.openbas.database.repository.SecurityPlatformRepository;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InjectExpectationTraceService {

  private final InjectExpectationTraceRepository injectExpectationTraceRepository;
  private final SecurityPlatformRepository securityPlatformRepository;

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

  public long getAlertLinksNumber(
      @NotNull String injectExpectationId,
      @NotNull String sourceId,
      String expectationResultSourceType) {
    if (expectationResultSourceType.equalsIgnoreCase("collector")) {
      SecurityPlatform securityPlatform =
          securityPlatformRepository.findByExternalReference(sourceId).orElseThrow();
      return this.injectExpectationTraceRepository.countAlerts(
          injectExpectationId, securityPlatform.getId());
    } else {
      return this.injectExpectationTraceRepository.countAlerts(injectExpectationId, sourceId);
    }
  }
}
