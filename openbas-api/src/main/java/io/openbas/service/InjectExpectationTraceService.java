package io.openbas.service;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.repository.InjectExpectationTraceRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InjectExpectationTraceService {

  private final InjectExpectationTraceRepository injectExpectationTraceRepository;

  public InjectExpectationTrace createInjectExpectationTrace(
      @NotNull InjectExpectationTrace injectExpectationTrace) {
    return this.injectExpectationTraceRepository.save(injectExpectationTrace);
  }

  public List<InjectExpectationTrace> getInjectExpectationTracesByExpectationAndCollector(
      @NotNull String injectExpectationId, @NotNull String collectorId) {
    return this.injectExpectationTraceRepository.findByExpectationAndCollector(injectExpectationId, collectorId);
  }
}
