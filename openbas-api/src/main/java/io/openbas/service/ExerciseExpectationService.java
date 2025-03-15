package io.openbas.service;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.repository.InjectExpectationRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ExerciseExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;

  @Transactional(readOnly = true)
  public List<InjectExpectation> injectExpectations(@NotBlank final String simulationId) {
    return this.injectExpectationRepository.findAllForSimulation(simulationId);
  }
}
