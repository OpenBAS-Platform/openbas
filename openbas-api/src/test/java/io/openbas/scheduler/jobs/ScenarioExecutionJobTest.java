package io.openbas.scheduler.jobs;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.scenario.ScenarioService;
import org.junit.jupiter.api.*;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.fixtures.ScenarioFixture.getScenario;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ScenarioExecutionJobTest {

  @Autowired
  private ScenarioExecutionJob job;

  @Autowired
  private ScenarioService scenarioService;
  @Autowired
  private ExerciseRepository exerciseRepository;

  static String SCENARIO_ID;
  static String EXERCISE_ID;

  @BeforeAll
  static void init() {

  }

  @AfterAll
  public void teardown() {
    this.scenarioService.deleteScenario(SCENARIO_ID);
    this.exerciseRepository.deleteById(EXERCISE_ID);
  }

  @DisplayName("Create simulation based on recurring scenario")
  @Test
  @Order(1)
  public void executeCreatedTest() throws JobExecutionException {
    // -- PREPARE --
    Scenario scenario = getScenario();
    scenario.setRecurrence("0 23 * * *"); // Every day at 23 hours
    Scenario scenarioSaved = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioSaved.getId();

    // -- EXECUTE --
    this.job.execute(null);

    // -- ASSERT --
    List<Exercise> createdExercises = fromIterable(
        this.exerciseRepository.findAll())
        .stream()
        .filter(exercise -> exercise.getScenario() != null)
        .filter(exercise -> SCENARIO_ID.equals(exercise.getScenario().getId()))
        .toList();
    assertEquals(1, createdExercises.size());
    Exercise createdExercise = createdExercises.get(0);
    assertNotNull(createdExercise.getStart());

    EXERCISE_ID = createdExercise.getId();
  }

  @DisplayName("Already created simulation based on recurring scenario")
  @Test
  @Order(2)
  public void executeNotCreatedTest() throws JobExecutionException {
    // -- EXECUTE --
    this.job.execute(null);

    // -- ASSERT --
    List<Exercise> createdExercises = fromIterable(
        this.exerciseRepository.findAll())
        .stream()
        .filter(exercise -> exercise.getScenario() != null)
        .filter(exercise -> SCENARIO_ID.equals(exercise.getScenario().getId()))
        .toList();
    assertEquals(1, createdExercises.size());
  }
}
