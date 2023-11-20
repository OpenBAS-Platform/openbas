package io.openex.service;

import io.openex.database.model.Exercise;
import io.openex.database.model.Variable;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.VariableRepository;
import io.openex.database.specification.VariableSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class VariableService {

  private final VariableRepository variableRepository;
  private final ExerciseRepository exerciseRepository;

  public Variable createVariable(
      @NotBlank final String exerciseId,
      @NotNull final Variable variable) {
    Exercise exercise = this.exerciseRepository.findById(exerciseId).orElseThrow();
    variable.setExercise(exercise);
    return this.variableRepository.save(variable);
  }

  public Variable variable(@NotBlank final String variableId) {
    return this.variableRepository.findById(variableId).orElseThrow();
  }

  public List<Variable> variables(@NotBlank final String exerciseId) {
    return this.variableRepository.findAll(VariableSpecification.fromExercise(exerciseId));
  }

  public Variable updateVariable(@NotNull final Variable variable) {
    variable.setUpdatedAt(now());
    return this.variableRepository.save(variable);
  }

  public void deleteVariable(@NotBlank final String variableId) {
    this.variableRepository.deleteById(variableId);
  }

}
