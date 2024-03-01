package io.openbas.rest.objective;

import io.openbas.database.model.Evaluation;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Objective;
import io.openbas.database.repository.EvaluationRepository;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.ObjectiveRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.database.specification.EvaluationSpecification;
import io.openbas.database.specification.ObjectiveSpecification;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.objective.form.EvaluationInput;
import io.openbas.rest.objective.form.ObjectiveInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.DatabaseHelper.resolveRelation;
import static java.time.Instant.now;

@RestController
public class ObjectiveApi extends RestBehavior {

  private ExerciseRepository exerciseRepository;
  private ObjectiveRepository objectiveRepository;
  private EvaluationRepository evaluationRepository;
  private UserRepository userRepository;

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setEvaluationRepository(EvaluationRepository evaluationRepository) {
    this.evaluationRepository = evaluationRepository;
  }

  @Autowired
  public void setExerciseRepository(ExerciseRepository exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  @Autowired
  public void setObjectiveRepository(ObjectiveRepository objectiveRepository) {
    this.objectiveRepository = objectiveRepository;
  }

  // region objectives
  @GetMapping("/api/exercises/{exerciseId}/objectives")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Objective> getMainObjectives(@PathVariable String exerciseId) {
    return objectiveRepository.findAll(ObjectiveSpecification.fromExercise(exerciseId));
  }

  @PostMapping("/api/exercises/{exerciseId}/objectives")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Objective createObjective(@PathVariable String exerciseId,
      @Valid @RequestBody ObjectiveInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    Objective objective = new Objective();
    objective.setUpdateAttributes(input);
    objective.setExercise(exercise);
    return objectiveRepository.save(objective);
  }

  @PutMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Objective updateObjective(@PathVariable String exerciseId,
      @PathVariable String objectiveId,
      @Valid @RequestBody ObjectiveInput input) {
    Objective objective = objectiveRepository.findById(objectiveId).orElseThrow();
    objective.setUpdateAttributes(input);
    return objectiveRepository.save(objective);
  }

  @DeleteMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteObjective(@PathVariable String exerciseId, @PathVariable String objectiveId) {
    objectiveRepository.deleteById(objectiveId);
  }
  // endregion

  // region evaluations
  @GetMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Evaluation getEvaluation(@PathVariable String exerciseId, @PathVariable String evaluationId) {
    return evaluationRepository.findById(evaluationId).orElseThrow();
  }

  @GetMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Evaluation> getEvaluations(@PathVariable String exerciseId, @PathVariable String objectiveId) {
    return evaluationRepository.findAll(EvaluationSpecification.fromObjective(objectiveId));
  }

  @PostMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  @Transactional(rollbackOn = Exception.class)
  public Evaluation createEvaluation(@PathVariable String exerciseId,
      @PathVariable String objectiveId,
      @Valid @RequestBody EvaluationInput input) {
    Evaluation evaluation = new Evaluation();
    evaluation.setUpdateAttributes(input);
    Objective objective = resolveRelation(objectiveId, objectiveRepository);
    evaluation.setObjective(objective);
    evaluation.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
    Evaluation result = evaluationRepository.save(evaluation);
    objective.setUpdatedAt(now());
    objectiveRepository.save(objective);
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    exercise.setUpdatedAt(now());
    exerciseRepository.save(exercise);
    return result;
  }

  @PutMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Evaluation updateEvaluation(@PathVariable String exerciseId,
      @PathVariable String objectiveId,
      @PathVariable String evaluationId,
      @Valid @RequestBody EvaluationInput input) {
    Evaluation evaluation = evaluationRepository.findById(evaluationId).orElseThrow();
    evaluation.setUpdateAttributes(input);
    Evaluation result = evaluationRepository.save(evaluation);
    Objective objective = objectiveRepository.findById(objectiveId).orElseThrow();
    objective.setUpdatedAt(now());
    objectiveRepository.save(objective);
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    exercise.setUpdatedAt(now());
    exerciseRepository.save(exercise);
    return result;
  }

  @DeleteMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations/{evaluationId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteEvaluation(@PathVariable String exerciseId, @PathVariable String evaluationId) {
    evaluationRepository.deleteById(evaluationId);
  }
  // endregion
}
