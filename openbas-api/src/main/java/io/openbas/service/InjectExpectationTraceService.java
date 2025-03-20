package io.openbas.service;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.repository.InjectExpectationTraceRepository;
import io.openbas.rest.inject_expectation_trace.form.InjectExpectationTraceInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import io.openbas.rest.exception.ElementNotFoundException;


@Service
@RequiredArgsConstructor
public class InjectExpectationTraceService {

  private final InjectExpectationTraceRepository injectExpectationTraceRepository;

  public InjectExpectationTrace createInjectExpectationTrace(
      @NotNull InjectExpectationTrace injectExpectationTrace) {
    Optional<InjectExpectationTrace> existingTrace =
        this.injectExpectationTraceRepository
            .findByAlertLinkAndAlertNameAndCollectorAndInjectExpectation(
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

}
