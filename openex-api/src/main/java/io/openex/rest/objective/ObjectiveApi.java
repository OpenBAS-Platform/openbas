package io.openex.rest.objective;

import io.openex.database.model.Evaluation;
import io.openex.database.model.Exercise;
import io.openex.database.model.Objective;
import io.openex.database.repository.EvaluationRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.ObjectiveRepository;
import io.openex.database.specification.EvaluationSpecification;
import io.openex.database.specification.ObjectiveSpecification;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.objective.form.EvaluationCreateInput;
import io.openex.rest.objective.form.ObjectiveCreateInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.helper.DatabaseHelper.resolveRelation;

@RestController
public class ObjectiveApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private ObjectiveRepository objectiveRepository;
    private EvaluationRepository evaluationRepository;

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
    public Iterable<Objective> getMainObjectives(@PathVariable String exerciseId) {
        return objectiveRepository.findAll(ObjectiveSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/objectives")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Objective createObjective(@PathVariable String exerciseId,
                                     @Valid @RequestBody ObjectiveCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Objective objective = new Objective();
        objective.setUpdateAttributes(input);
        objective.setExercise(exercise);
        return objectiveRepository.save(objective);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteObjective(@PathVariable String objectiveId) {
        objectiveRepository.deleteById(objectiveId);
    }
    // endregion

    // region evaluations
    @GetMapping("/api/evaluations/{evaluationId}")
    public Evaluation getEvaluation(@PathVariable String evaluationId) {
        return evaluationRepository.findById(evaluationId).orElseThrow();
    }

    @GetMapping("/api/exercises/{exerciseId}/objectives/{objectiveId}/evaluations")
    public Iterable<Evaluation> getEvaluations(@PathVariable String objectiveId) {
        return evaluationRepository.findAll(EvaluationSpecification.fromObjective(objectiveId));
    }

    @PostMapping("/api/exercises/{exerciseId}/evaluations")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Evaluation createEvaluation(@Valid @RequestBody EvaluationCreateInput input) {
        Evaluation evaluation = new Evaluation();
        evaluation.setUpdateAttributes(input);
        evaluation.setObjective(resolveRelation(input.getObjectiveId(), objectiveRepository));
        evaluation.setUser(currentUser());
        return evaluationRepository.save(evaluation);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/evaluations/{evaluationId}")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteEvaluation(@PathVariable String evaluationId) {
        evaluationRepository.deleteById(evaluationId);
    }
    // endregion
}
