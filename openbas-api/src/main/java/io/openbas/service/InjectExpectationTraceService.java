package io.openbas.service;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.repository.InjectExpectationTraceRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InjectExpectationTraceService {

  private final InjectExpectationTraceRepository injectExpectationTraceRepository;

  public InjectExpectationTrace createInjectExpectationTrace(
      @NotNull InjectExpectationTrace injectExpectationTrace) {
    return this.injectExpectationTraceRepository.save(injectExpectationTrace);
  }
}
