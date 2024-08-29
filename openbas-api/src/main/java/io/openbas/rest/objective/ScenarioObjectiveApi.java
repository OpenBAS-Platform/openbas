package io.openbas.rest.objective;

import io.openbas.database.model.Evaluation;
import io.openbas.database.model.Objective;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.EvaluationRepository;
import io.openbas.database.repository.ObjectiveRepository;
import io.openbas.database.repository.ScenarioRepository;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.DatabaseHelper.resolveRelation;
import static java.time.Instant.now;

@RestController
@RequiredArgsConstructor
public class ScenarioObjectiveApi extends RestBehavior {

    public static final String SCENARIO_URI = "/api/scenarios/";

    private final ScenarioRepository scenarioRepository;
    private final ObjectiveRepository objectiveRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    // region objectives
    @GetMapping(SCENARIO_URI + "{scenarioId}/objectives")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public Iterable<Objective> getMainObjectives(@PathVariable String scenarioId) {
        return objectiveRepository.findAll(ObjectiveSpecification.fromScenario(scenarioId));
    }

    @PostMapping(SCENARIO_URI + "{scenarioId}/objectives")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public Objective createObjective(@PathVariable String scenarioId,
                                     @Valid @RequestBody ObjectiveInput input) {
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);
        Objective objective = new Objective();
        objective.setUpdateAttributes(input);
        objective.setScenario(scenario);
        return objectiveRepository.save(objective);
    }

    @PutMapping(SCENARIO_URI + "{scenarioId}/objectives/{objectiveId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public Objective updateObjective(@PathVariable String scenarioId,
                                     @PathVariable String objectiveId,
                                     @Valid @RequestBody ObjectiveInput input) {
        Objective objective = objectiveRepository.findById(objectiveId).orElseThrow(ElementNotFoundException::new);
        objective.setUpdateAttributes(input);
        return objectiveRepository.save(objective);
    }

    @DeleteMapping(SCENARIO_URI + "{scenarioId}/objectives/{objectiveId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public void deleteObjective(@PathVariable String scenarioId, @PathVariable String objectiveId) {
        objectiveRepository.deleteById(objectiveId);
    }
    // endregion

    // region evaluations
    @GetMapping(SCENARIO_URI + "{scenarioId}/objectives/{objectiveId}/evaluations/{evaluationId}")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public Evaluation getEvaluation(@PathVariable String scenarioId, @PathVariable String evaluationId) {
        return evaluationRepository.findById(evaluationId).orElseThrow(ElementNotFoundException::new);
    }

    @GetMapping(SCENARIO_URI + "{scenarioId}/objectives/{objectiveId}/evaluations")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public Iterable<Evaluation> getEvaluations(@PathVariable String scenarioId, @PathVariable String objectiveId) {
        return evaluationRepository.findAll(EvaluationSpecification.fromObjective(objectiveId));
    }

    @PostMapping(SCENARIO_URI + "{scenarioId}/objectives/{objectiveId}/evaluations")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public Evaluation createEvaluation(@PathVariable String scenarioId,
                                       @PathVariable String objectiveId,
                                       @Valid @RequestBody EvaluationInput input) {
        Evaluation evaluation = new Evaluation();
        evaluation.setUpdateAttributes(input);
        Objective objective = resolveRelation(objectiveId, objectiveRepository);
        evaluation.setObjective(objective);
        evaluation.setUser(userRepository.findById(currentUser().getId()).orElseThrow(ElementNotFoundException::new));
        Evaluation result = evaluationRepository.save(evaluation);
        objective.setUpdatedAt(now());
        objectiveRepository.save(objective);
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);
        scenario.setUpdatedAt(now());
        scenarioRepository.save(scenario);
        return result;
    }

    @PutMapping(SCENARIO_URI + "{scenarioId}/objectives/{objectiveId}/evaluations/{evaluationId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public Evaluation updateEvaluation(@PathVariable String scenarioId,
                                       @PathVariable String objectiveId,
                                       @PathVariable String evaluationId,
                                       @Valid @RequestBody EvaluationInput input) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId).orElseThrow(ElementNotFoundException::new);
        evaluation.setUpdateAttributes(input);
        Evaluation result = evaluationRepository.save(evaluation);
        Objective objective = objectiveRepository.findById(objectiveId).orElseThrow(ElementNotFoundException::new);
        objective.setUpdatedAt(now());
        objectiveRepository.save(objective);
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);
        scenario.setUpdatedAt(now());
        scenarioRepository.save(scenario);
        return result;
    }

    @DeleteMapping(SCENARIO_URI + "{scenarioId}/objectives/{objectiveId}/evaluations/{evaluationId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public void deleteEvaluation(@PathVariable String scenarioId, @PathVariable String evaluationId) {
        evaluationRepository.deleteById(evaluationId);
    }
    // endregion
}
