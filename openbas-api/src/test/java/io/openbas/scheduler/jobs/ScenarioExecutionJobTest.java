package io.openbas.scheduler.jobs;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.scenario.ScenarioService;
import org.junit.jupiter.api.*;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.fixtures.ScenarioFixture.getScenario;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ScenarioExecutionJobTest {

  @Autowired
  private ScenarioExecutionJob job;

  @Autowired
  private ScenarioService scenarioService;
  @Autowired
  private ExerciseRepository exerciseRepository;

  static String SCENARIO_ID_1;
  static String SCENARIO_ID_2;
  static String SCENARIO_ID_3;
  static String EXERCISE_ID;

  @AfterAll
  public void teardown() {
    this.scenarioService.deleteScenario(SCENARIO_ID_1);
    this.scenarioService.deleteScenario(SCENARIO_ID_2);
    this.scenarioService.deleteScenario(SCENARIO_ID_3);
    this.exerciseRepository.deleteById(EXERCISE_ID);
  }

  @DisplayName("Not create simulation based on recurring scenario in one hour")
  @Test
  @Order(1)
  public void given_cron_in_one_hour_should_not_create_simulation() throws JobExecutionException {
    // -- PREPARE --
    Instant instant = Instant.now();
    ZonedDateTime zonedDateTime = instant.atZone(ZoneId.of("UTC"));
    int hourToStart = zonedDateTime.getHour() == 23 ? 0 : zonedDateTime.getHour() + 1;

    Scenario scenario = getScenario();
    scenario.setRecurrence("0 0 " + hourToStart + " * * *"); // Every day at 23 hours
    Scenario scenarioSaved = this.scenarioService.createScenario(scenario);
    SCENARIO_ID_1 = scenarioSaved.getId();

    // -- EXECUTE --
    this.job.execute(null);

    // -- ASSERT --
    List<Exercise> createdExercises = fromIterable(
        this.exerciseRepository.findAll())
        .stream()
        .filter(exercise -> exercise.getScenario() != null)
        .filter(exercise -> SCENARIO_ID_1.equals(exercise.getScenario().getId()))
        .toList();
    assertEquals(0, createdExercises.size());
  }

  @DisplayName("Create simulation based on recurring scenario now")
  @Test
  @Order(2)
  public void given_cron_in_one_minute_should_create_simulation() throws JobExecutionException {
    // -- PREPARE --
    Instant instant = Instant.now();
    ZonedDateTime zonedDateTime = instant.atZone(ZoneId.of("UTC"));

    Scenario scenario = getScenario();
    scenario.setRecurrence(
        "0 " + (zonedDateTime.getMinute() + 1) + " " + zonedDateTime.getHour() + " * * *"); // Every day now + 1 minute
    Scenario scenarioSaved = this.scenarioService.createScenario(scenario);
    SCENARIO_ID_2 = scenarioSaved.getId();

    // -- EXECUTE --
    this.job.execute(null);

    // -- ASSERT --
    List<Exercise> createdExercises = fromIterable(
        this.exerciseRepository.findAll())
        .stream()
        .filter(exercise -> exercise.getScenario() != null)
        .filter(exercise -> SCENARIO_ID_2.equals(exercise.getScenario().getId()))
        .toList();
    assertEquals(1, createdExercises.size());
    Exercise createdExercise = createdExercises.get(0);
    assertNotNull(createdExercise.getStart());

    EXERCISE_ID = createdExercise.getId();
  }

  @DisplayName("Already created simulation based on recurring scenario")
  @Test
  @Order(3)
  public void given_cron_in_one_minute_should_not_create_second_simulation() throws JobExecutionException {
    // -- EXECUTE --
    this.job.execute(null);

    // -- ASSERT --
    List<Exercise> createdExercises = fromIterable(
        this.exerciseRepository.findAll())
        .stream()
        .filter(exercise -> exercise.getScenario() != null)
        .filter(exercise -> SCENARIO_ID_2.equals(exercise.getScenario().getId()))
        .toList();
    assertEquals(1, createdExercises.size());
  }

  @DisplayName("Not create simulation based on end date before now")
  @Test
  @Order(4)
  public void given_end_date_before_now_should_not_create_second_simulation() throws JobExecutionException {
    // -- PREPARE --
    Instant instant = Instant.now();
    ZonedDateTime zonedDateTime = instant.atZone(ZoneId.of("UTC"));

    Scenario scenario = getScenario();
    scenario.setRecurrence(
        "0 " + (zonedDateTime.getMinute() + 1) + " " + zonedDateTime.getHour() + " * * *"); // Every day now + 1 minute
    scenario.setRecurrenceEnd(Instant.now().minus(0, ChronoUnit.DAYS));
    Scenario scenarioSaved = this.scenarioService.createScenario(scenario);
    SCENARIO_ID_3 = scenarioSaved.getId();

    // -- EXECUTE --
    this.job.execute(null);

    // -- ASSERT --
    List<Exercise> createdExercises = fromIterable(
        this.exerciseRepository.findAll())
        .stream()
        .filter(exercise -> exercise.getScenario() != null)
        .filter(exercise -> SCENARIO_ID_3.equals(exercise.getScenario().getId()))
        .toList();
    assertEquals(0, createdExercises.size());
  }
}
