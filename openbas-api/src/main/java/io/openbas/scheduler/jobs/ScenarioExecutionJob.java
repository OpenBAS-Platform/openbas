package io.openbas.scheduler.jobs;

import com.cronutils.model.Cron;
import com.cronutils.model.CronType;
import com.cronutils.model.definition.CronDefinition;
import com.cronutils.model.definition.CronDefinitionBuilder;
import com.cronutils.model.time.ExecutionTime;
import com.cronutils.parser.CronParser;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.service.ScenarioService;
import io.openbas.service.ScenarioToExerciseService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static io.openbas.database.specification.ExerciseSpecification.recurringInstanceNotStarted;

@Component
@RequiredArgsConstructor
public class ScenarioExecutionJob implements Job {

  private final ScenarioService scenarioService;
  private final ExerciseRepository exerciseRepository;
  private final ScenarioToExerciseService scenarioToExerciseService;

  @Override
  @Transactional(rollbackFor = Exception.class)
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    createExercisesFromScenarios();
    cleanOutdatedRecurringScenario();
  }

  private void createExercisesFromScenarios() {
    // Find each scenario with cron where now is between start and end date
    List<Scenario> scenarios = this.scenarioService.recurringScenarios(Instant.now());
    // Filter on valid cron scenario -> Start date on cron is in 1 minute
    List<Scenario> validScenarios = scenarios.stream()
        .filter(scenario -> {
          Instant startDate = cronToDate(scenario.getRecurrence()).minus(1, ChronoUnit.MINUTES);
          Instant now = Instant.now();

          ZonedDateTime startDateMinute = startDate.atZone(ZoneId.of("UTC")).truncatedTo(ChronoUnit.MINUTES);
          ZonedDateTime nowMinute = now.atZone(ZoneId.of("UTC")).truncatedTo(ChronoUnit.MINUTES);
          return startDateMinute.equals(nowMinute);
        })
        .toList();
    // Check if a simulation link to this scenario already exists
    // Retrieve simulations not started, link to a scenario
    List<String> alreadyExistIds = this.exerciseRepository.findAll(recurringInstanceNotStarted())
        .stream()
        .map(Exercise::getScenario)
        .map(Scenario::getId)
        .toList();
    // Filter scenarios with this results
    validScenarios.stream()
        .filter(scenario -> !alreadyExistIds.contains(scenario.getId()))
        // Create simulation with start date provided by cron
        .forEach(scenario -> this.scenarioToExerciseService.toExercise(scenario, cronToDate(scenario.getRecurrence()),
            false));
  }

  private void cleanOutdatedRecurringScenario() {
    // Find each scenario with cron is outdated:
    List<Scenario> scenarios = this.scenarioService.potentialOutdatedRecurringScenario(Instant.now());
    List<Scenario> validScenarios = scenarios.stream()
        .filter(this::isScenarioOutdated)
        .toList();

    // Remove recurring setup
    validScenarios.forEach(s -> {
      s.setRecurrenceStart(null);
      s.setRecurrenceEnd(null);
      s.setRecurrence(null);
    });
    // Save it
    this.scenarioService.updateScenarios(scenarios);
  }

  private boolean isScenarioOutdated(@NotNull final Scenario scenario) {
    if (scenario.getRecurrenceEnd() == null) {
      return false;
    }
    // End date is passed
    if (scenario.getRecurrenceEnd().isBefore(Instant.now())) {
      return true;
    }

    // There are no next execution -> example: end date is tomorrow at 1AM and execution cron is at 6AM and it's 6PM
    Instant nextExecution = cronToDate(scenario.getRecurrence());
    return nextExecution.isAfter(scenario.getRecurrenceEnd());
  }

  // -- UTILS --

  private Instant cronToDate(@NotBlank final String cronExpression) {
    CronDefinition cronDefinition = CronDefinitionBuilder.instanceDefinitionFor(CronType.SPRING53);
    CronParser parser = new CronParser(cronDefinition);
    Cron cron = parser.parse(cronExpression);
    ExecutionTime executionTime = ExecutionTime.forCron(cron);

    Duration timeToNextExecution = executionTime.timeToNextExecution(ZonedDateTime.now(ZoneId.of("UTC")))
        .orElse(Duration.ZERO);

    return Instant.now().plus(timeToNextExecution);
  }

}
