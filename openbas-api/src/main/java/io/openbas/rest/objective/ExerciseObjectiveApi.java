package io.openbas.rest.objective;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.DatabaseHelper.resolveRelation;
import static java.time.Instant.now;

import io.openbas.aop.RBAC;
import io.openbas.database.model.*;
import io.openbas.database.repository.EvaluationRepository;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.ObjectiveRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.database.specification.EvaluationSpecification;
import io.openbas.database.specification.ObjectiveSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.objective.form.EvaluationInput;
import io.openbas.rest.objective.form.ObjectiveInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ExerciseObjectiveApi extends RestBehavior {

  public static final String EXERCISE_URI = "/api/exercises/";

  private final ExerciseRepository exerciseRepository;
  private final ObjectiveRepository objectiveRepository;
  private final EvaluationRepository evaluationRepository;
  private final UserRepository userRepository;

  // region objectives
  @GetMapping(EXERCISE_URI + "{exerciseId}/objectives")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.SIMULATION)
  public Iterable<Objective> getMainObjectives(@PathVariable String exerciseId) {
    return objectiveRepository.findAll(ObjectiveSpecification.fromExercise(exerciseId));
  }

  @PostMapping(EXERCISE_URI + "{exerciseId}/objectives")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.WRITE,
      resourceType = ResourceType.SIMULATION)
  @Transactional(rollbackOn = Exception.class)
  public Objective createObjective(
      @PathVariable String exerciseId, @Valid @RequestBody ObjectiveInput input) {
    Exercise exercise =
        exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    Objective objective = new Objective();
    objective.setUpdateAttributes(input);
    objective.setExercise(exercise);
    return objectiveRepository.save(objective);
  }

  @PutMapping(EXERCISE_URI + "{exerciseId}/objectives/{objectiveId}")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.WRITE,
      resourceType = ResourceType.SIMULATION)
  public Objective updateObjective(
      @PathVariable String exerciseId,
      @PathVariable String objectiveId,
      @Valid @RequestBody ObjectiveInput input) {
    Objective objective =
        objectiveRepository.findById(objectiveId).orElseThrow(ElementNotFoundException::new);
    objective.setUpdateAttributes(input);
    return objectiveRepository.save(objective);
  }

  @DeleteMapping(EXERCISE_URI + "{exerciseId}/objectives/{objectiveId}")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.WRITE,
      resourceType = ResourceType.SIMULATION)
  public void deleteObjective(@PathVariable String exerciseId, @PathVariable String objectiveId) {
    objectiveRepository.deleteById(objectiveId);
  }

  // endregion

  // region evaluations
  @GetMapping(EXERCISE_URI + "{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.SIMULATION)
  public Evaluation getEvaluation(
      @PathVariable String exerciseId, @PathVariable String evaluationId) {
    return evaluationRepository.findById(evaluationId).orElseThrow(ElementNotFoundException::new);
  }

  @GetMapping(EXERCISE_URI + "{exerciseId}/objectives/{objectiveId}/evaluations")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.SIMULATION)
  public Iterable<Evaluation> getEvaluations(
      @PathVariable String exerciseId, @PathVariable String objectiveId) {
    return evaluationRepository.findAll(EvaluationSpecification.fromObjective(objectiveId));
  }

  @PostMapping(EXERCISE_URI + "{exerciseId}/objectives/{objectiveId}/evaluations")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.WRITE,
      resourceType = ResourceType.SIMULATION)
  @Transactional(rollbackOn = Exception.class)
  public Evaluation createEvaluation(
      @PathVariable String exerciseId,
      @PathVariable String objectiveId,
      @Valid @RequestBody EvaluationInput input) {
    Evaluation evaluation = new Evaluation();
    evaluation.setUpdateAttributes(input);
    Objective objective = resolveRelation(objectiveId, objectiveRepository);
    evaluation.setObjective(objective);
    evaluation.setUser(
        userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new ElementNotFoundException("Current user not found")));
    Evaluation result = evaluationRepository.save(evaluation);
    objective.setUpdatedAt(now());
    objectiveRepository.save(objective);
    Exercise exercise =
        exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    exercise.setUpdatedAt(now());
    exerciseRepository.save(exercise);
    return result;
  }

  @PutMapping(EXERCISE_URI + "{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.WRITE,
      resourceType = ResourceType.SIMULATION)
  public Evaluation updateEvaluation(
      @PathVariable String exerciseId,
      @PathVariable String objectiveId,
      @PathVariable String evaluationId,
      @Valid @RequestBody EvaluationInput input) {
    Evaluation evaluation =
        evaluationRepository.findById(evaluationId).orElseThrow(ElementNotFoundException::new);
    evaluation.setUpdateAttributes(input);
    Evaluation result = evaluationRepository.save(evaluation);
    Objective objective =
        objectiveRepository.findById(objectiveId).orElseThrow(ElementNotFoundException::new);
    objective.setUpdatedAt(now());
    objectiveRepository.save(objective);
    Exercise exercise =
        exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    exercise.setUpdatedAt(now());
    exerciseRepository.save(exercise);
    return result;
  }

  @DeleteMapping(EXERCISE_URI + "{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.WRITE,
      resourceType = ResourceType.SIMULATION)
  public void deleteEvaluation(@PathVariable String exerciseId, @PathVariable String evaluationId) {
    evaluationRepository.deleteById(evaluationId);
  }
  // endregion
}
