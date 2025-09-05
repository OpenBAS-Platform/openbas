package io.openbas.scheduler.jobs;

import static io.openbas.database.model.CollectExecutionStatus.COMPLETED;
import static io.openbas.utils.inject_expectation_result.InjectExpectationResultUtils.hasValidResults;
import static java.time.Instant.now;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.groupingBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectDependenciesRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.helper.InjectHelper;
import io.openbas.notification.model.NotificationEvent;
import io.openbas.notification.model.NotificationEventType;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.rest.inject.service.InjectStatusService;
import io.openbas.scheduler.jobs.exception.ErrorMessagesPreExecutionException;
import io.openbas.service.NotificationEventService;
import io.openbas.telemetry.metric_collectors.ActionMetricCollector;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.core.env.Environment;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.stereotype.Component;

@Component
@DisallowConcurrentExecution
@RequiredArgsConstructor
@Slf4j
public class InjectsExecutionJob implements Job {

  public static final String DEFAULT_EXECUTION_THRESHOLD_TIME_IN_MINUTS = "10";
  private static final long delayForSimulationCompletedEvent = 3600L;

  private final Environment env;
  private int injectExecutionThreshold;

  private final InjectHelper injectHelper;
  private final InjectService injectService;
  private final ExerciseRepository exerciseRepository;
  private final InjectDependenciesRepository injectDependenciesRepository;
  private final InjectExpectationRepository injectExpectationRepository;
  private final InjectStatusService injectStatusService;
  private final io.openbas.executors.Executor executor;
  private final ActionMetricCollector actionMetricCollector;
  private final NotificationEventService notificationEventService;

  private final List<ExecutionStatus> executionStatusesNotReady =
      List.of(
          ExecutionStatus.QUEUING,
          ExecutionStatus.DRAFT,
          ExecutionStatus.EXECUTING,
          ExecutionStatus.PENDING);

  private final List<InjectExpectation.EXPECTATION_STATUS> expectationStatusesSuccess =
      List.of(InjectExpectation.EXPECTATION_STATUS.SUCCESS);

  @Resource protected ObjectMapper mapper;

  @PostConstruct
  private void init() {
    String threshold = env.getProperty("inject.execution.threshold.minutes");
    if (threshold == null || threshold.isBlank()) {
      threshold = DEFAULT_EXECUTION_THRESHOLD_TIME_IN_MINUTS;
    }
    this.injectExecutionThreshold = Integer.parseInt(threshold);
  }

  public void handleAutoStartExercises() {
    List<Exercise> exercises = exerciseRepository.findAllShouldBeInRunningState(now());
    if (exercises.isEmpty()) {
      return;
    }
    actionMetricCollector.addSimulationPlayedCount(exercises.size());
    exerciseRepository.saveAll(
        exercises.stream()
            .peek(
                exercise -> {
                  exercise.setStatus(ExerciseStatus.RUNNING);
                  exercise.setUpdatedAt(now());
                })
            .toList());
  }

  public void handleAutoClosingExercises() {
    // Change status of finished exercises.
    List<Exercise> mustBeFinishedExercises = exerciseRepository.thatMustBeFinished();
    List<Exercise> exercisesFinished =
        exerciseRepository.saveAll(
            mustBeFinishedExercises.stream()
                .peek(
                    exercise -> {
                      exercise.setStatus(ExerciseStatus.FINISHED);
                      exercise.setEnd(now());
                      exercise.setUpdatedAt(now());
                    })
                .toList());

    // send notification
    exercisesFinished.stream()
        .filter(
            ex ->
                ex.getScenario()
                    != null) // only send notification for exercise associated to a scenario
        .forEach(
            ex ->
                notificationEventService.sendNotificationEventWithDelay(
                    NotificationEvent.builder()
                        .eventType(NotificationEventType.SIMULATION_COMPLETED)
                        .resourceType(NotificationRuleResourceType.SCENARIO)
                        .resourceId(ex.getScenario().getId())
                        .timestamp(Instant.now())
                        .build(),
                    delayForSimulationCompletedEvent));
  }

  public void handlePendingInject() {
    List<Inject> pendingInjects =
        injectHelper.getAllPendingInjectsWithThresholdMinutes(this.injectExecutionThreshold);

    if (pendingInjects.isEmpty()) {
      return;
    }

    List<InjectStatus> updatedStatuses =
        pendingInjects.stream()
            .map(
                inject -> {
                  InjectStatus status =
                      inject.getStatus().orElseThrow(ElementNotFoundException::new);
                  status.setName(ExecutionStatus.MAYBE_PREVENTED);
                  status.addWarningTrace(
                      "Execution delay detected: Inject exceeded the "
                          + this.injectExecutionThreshold
                          + " minutes threshold.",
                      ExecutionTraceAction.EXECUTION);
                  return status;
                })
            .collect(Collectors.toList());

    injectStatusService.saveAll(updatedStatuses);
  }

  private void executeInject(ExecutableInject executableInject)
      throws IOException, TimeoutException, ErrorMessagesPreExecutionException {
    // Depending on injector type (internal or external) execution must be done differently
    Inject inject = executableInject.getInjection().getInject();
    // We are now checking if we depend on another inject and if it did not failed
    if (ofNullable(executableInject.getExerciseId()).isPresent()) {
      checkErrorMessagesPreExecution(executableInject.getExerciseId(), inject);
    }
    if (!inject.isReady()) {
      throw new UnsupportedOperationException(
          "The inject is not ready to be executed (missing mandatory fields)");
    }
    log.info("Executing inject {}", inject.getInject().getTitle());
    this.executor.execute(executableInject);
  }

  /**
   * Get error messages if pre execution conditions are not met
   *
   * @param exerciseId the id of the exercise
   * @param inject the inject to check
   */
  private void checkErrorMessagesPreExecution(String exerciseId, Inject inject)
      throws ErrorMessagesPreExecutionException {
    List<InjectDependency> injectDependencies =
        injectDependenciesRepository.findParents(List.of(inject.getId()));
    if (!injectDependencies.isEmpty()) {
      List<Inject> parents =
          injectDependencies.stream()
              .map(injectDependency -> injectDependency.getCompositeId().getInjectParent())
              .toList();

      Map<String, Boolean> mapCondition =
          getStringBooleanMap(parents, exerciseId, injectDependencies);

      List<String> errorMessages = new ArrayList<>();

      for (InjectDependency injectDependency : injectDependencies) {
        String expressionToEvaluate = injectDependency.getInjectDependencyCondition().toString();
        List<String> conditions =
            injectDependency.getInjectDependencyCondition().getConditions().stream()
                .map(InjectDependencyConditions.Condition::toString)
                .toList();
        for (String condition : conditions) {
          expressionToEvaluate =
              expressionToEvaluate.replaceAll(
                  condition.split("==")[0].trim(),
                  String.format("#this['%s']", condition.split("==")[0].trim()));
        }

        ExpressionParser parser = new SpelExpressionParser();
        Expression exp = parser.parseExpression(expressionToEvaluate);
        boolean canBeExecuted = Boolean.TRUE.equals(exp.getValue(mapCondition, Boolean.class));
        if (!canBeExecuted) {
          if (errorMessages.isEmpty()) {
            errorMessages.add(
                "This inject depends on other injects expectations that are not met. The following conditions were not as expected : ");
          }
          errorMessages.addAll(
              labelFromCondition(
                  injectDependency.getCompositeId().getInjectParent(),
                  injectDependency.getInjectDependencyCondition()));
        }
      }
      if (!errorMessages.isEmpty()) {
        throw new ErrorMessagesPreExecutionException(errorMessages);
      }
    }
  }

  /**
   * Get a map containing the expectations and if they are met or not
   *
   * @param parents the parents injects
   * @param exerciseId the id of the exercise
   * @param injectDependencies the list of dependencies
   * @return a map of expectations and their value
   */
  private @NotNull Map<String, Boolean> getStringBooleanMap(
      List<Inject> parents, String exerciseId, List<InjectDependency> injectDependencies) {
    Map<String, Boolean> mapCondition =
        injectDependencies.stream()
            .flatMap(
                injectDependency ->
                    injectDependency.getInjectDependencyCondition().getConditions().stream())
            .collect(
                Collectors.toMap(InjectDependencyConditions.Condition::getKey, condition -> false));

    parents.forEach(
        parent -> {
          mapCondition.put(
              "Execution",
              parent.getStatus().isPresent()
                  && !ExecutionStatus.ERROR.equals(parent.getStatus().get().getName())
                  && !executionStatusesNotReady.contains(parent.getStatus().get().getName()));

          List<InjectExpectation> expectations =
              injectExpectationRepository.findAllForExerciseAndInject(exerciseId, parent.getId());
          expectations.forEach(
              injectExpectation -> {
                String name =
                    StringUtils.capitalize(injectExpectation.getType().toString().toLowerCase());
                if (injectExpectation.getType().equals(InjectExpectation.EXPECTATION_TYPE.MANUAL)) {
                  name = injectExpectation.getName();
                }
                if (InjectExpectation.EXPECTATION_TYPE.CHALLENGE.equals(injectExpectation.getType())
                    || InjectExpectation.EXPECTATION_TYPE.ARTICLE.equals(
                        injectExpectation.getType())) {
                  if (injectExpectation.getUser() == null && injectExpectation.getScore() != null) {
                    mapCondition.put(
                        name, injectExpectation.getScore() >= injectExpectation.getExpectedScore());
                  }
                } else {
                  mapCondition.put(
                      name, expectationStatusesSuccess.contains(injectExpectation.getResponse()));
                }
              });
        });
    return mapCondition;
  }

  private List<String> labelFromCondition(
      Inject injectParent, InjectDependencyConditions.InjectDependencyCondition condition) {
    List<String> result = new ArrayList<>();
    for (InjectDependencyConditions.Condition conditionElement : condition.getConditions()) {
      result.add(
          String.format(
              "Inject '%s' - %s is %s",
              injectParent.getTitle(), conditionElement.getKey(), conditionElement.isValue()));
    }
    return result;
  }

  public void updateExercise(String exerciseId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    exercise.setUpdatedAt(now());
    exerciseRepository.save(exercise);
  }

  @Override
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    try {
      // Handle starting exercises if needed.
      handleAutoStartExercises();
      // Get all injects to execute grouped by exercise.
      List<ExecutableInject> injects = injectHelper.getInjectsToRun();

      // We're grouping the injects to run by exercises but also making sure no injects
      // run in the same batch as it's parents
      Map<String, List<ExecutableInject>> byExercises =
          injects.stream()
              .filter(
                  executableInject ->
                      // If we got dependencies, we check that the parents are not part of the
                      // current batch of injects running. If so, we're filtering them out and
                      // they'll be part of the next batch of launched injects. Do note that this is
                      // an edge case as it's not allowed to add a dependency less than a minute
                      // after a parent but can happen if the platform was restarted after some time
                      // out. It'll then start the injects that were not started because the
                      // platform was down.
                      executableInject.getInjection().getInject().getDependsOn() == null
                          || !intersect(
                              injects.stream()
                                  .map(execInject -> execInject.getInjection().getId())
                                  .toList(),
                              executableInject.getInjection().getInject().getDependsOn().stream()
                                  .map(
                                      injectDependency ->
                                          injectDependency
                                              .getCompositeId()
                                              .getInjectParent()
                                              .getInject()
                                              .getId())
                                  .toList()))
              .collect(
                  groupingBy(
                      ex ->
                          ex.getInjection().getExercise() == null
                              ? "atomic"
                              : ex.getInjection().getExercise().getId()));

      // Execute injects in parallel for each exercise.
      byExercises.entrySet().parallelStream()
          .forEach(
              (entry) -> {
                // Execute each inject for the exercise in order.
                entry.getValue().parallelStream()
                    .forEach(
                        executableInject -> {
                          try {
                            this.executeInject(executableInject);
                          } catch (Exception e) {
                            Inject inject = executableInject.getInjection().getInject();
                            log.warn(e.getMessage(), e);
                            injectStatusService.failInjectStatus(inject.getId(), e.getMessage());
                          }
                        });
                // Update the exercise
                if (!entry.getKey().equals("atomic")) {
                  updateExercise(entry.getKey());
                }
              });
      // Change status of finished exercises.
      handleAutoClosingExercises();
      handlePendingInject();
      handleInjectExpectationCollectStatus();
    } catch (Exception e) {
      log.error(e.getMessage(), e);
      throw new JobExecutionException(e);
    }
  }

  private void handleInjectExpectationCollectStatus() {
    List<Inject> injects = injectService.isExecutedAndNotFinished();
    if (injects.isEmpty()) {
      return;
    }
    List<Inject> fulfilled = new ArrayList<>();
    for (Inject inject : injects) {
      if (inject.getExpectations().isEmpty() && inject.getCollectExecutionStatus() == null) {
        return;
      }
      List<InjectExpectationResult> results =
          inject.getExpectations().stream().flatMap(ie -> ie.getResults().stream()).toList();
      if (hasValidResults(results)) {
        inject.setCollectExecutionStatus(COMPLETED);
        fulfilled.add(inject);
      }
    }
    if (!fulfilled.isEmpty()) injectService.saveAll(fulfilled);
  }

  /**
   * Return true if some elements are in the two lists
   *
   * @param firstList the first list to test
   * @param secondList the second list to test
   * @return true if some elements are present in both the lists
   */
  private boolean intersect(List<String> firstList, List<String> secondList) {
    return !firstList.stream()
        .distinct()
        .filter(secondList::contains)
        .collect(Collectors.toSet())
        .isEmpty();
  }
}
