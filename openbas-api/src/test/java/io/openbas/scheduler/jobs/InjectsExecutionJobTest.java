package io.openbas.scheduler.jobs;

import static org.junit.jupiter.api.Assertions.*;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.AgentComposer;
import io.openbas.utils.fixtures.composers.EndpointComposer;
import io.openbas.utils.fixtures.composers.InjectComposer;
import io.openbas.utils.fixtures.composers.InjectStatusComposer;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InjectsExecutionJobTest extends IntegrationTest {

  @Autowired private InjectsExecutionJob job;

  @Autowired private ExerciseService exerciseService;
  @Autowired private ExerciseRepository exerciseRepository;
  @Autowired private InjectRepository injectRepository;

  @Autowired private InjectComposer injectComposer;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private AgentComposer agentComposer;
  @Autowired private InjectStatusComposer injectStatusComposer;

  static String EXERCISE_ID;

  @AfterAll
  public void teardown() {
    this.exerciseRepository.deleteById(EXERCISE_ID);
  }

  @DisplayName("Not start children injects at the same time as parent injects")
  @Test
  @Order(1)
  void given_cron_in_one_minute_should_not_start_children_injects() throws JobExecutionException {
    // -- PREPARE --
    Exercise exercise = ExerciseFixture.getExercise();
    exercise.setStart(Instant.now().minus(1, ChronoUnit.MINUTES));
    Exercise exerciseSaved = this.exerciseService.createExercise(exercise);
    Inject injectParent =
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withEndpoint(
                endpointComposer
                    .forEndpoint(EndpointFixture.createEndpoint())
                    .withAgent(agentComposer.forAgent(AgentFixture.createDefaultAgentService()))
                    .withAgent(agentComposer.forAgent(AgentFixture.createDefaultAgentSession())))
            .withInjectStatus(
                injectStatusComposer.forInjectStatus(
                    InjectStatusFixture.createPendingInjectStatus()))
            .persist()
            .get();
    Inject injectChildren =
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withEndpoint(
                endpointComposer
                    .forEndpoint(EndpointFixture.createEndpoint())
                    .withAgent(agentComposer.forAgent(AgentFixture.createDefaultAgentService()))
                    .withAgent(agentComposer.forAgent(AgentFixture.createDefaultAgentSession())))
            .withInjectStatus(
                injectStatusComposer.forInjectStatus(
                    InjectStatusFixture.createPendingInjectStatus()))
            .withDependsOn(injectParent)
            .persist()
            .get();
    injectParent.setExercise(exerciseSaved);
    injectChildren.setExercise(exerciseSaved);
    injectParent.setStatus(null);
    injectChildren.setStatus(null);
    exerciseSaved.setInjects(List.of(injectParent, injectChildren));
    EXERCISE_ID = exerciseSaved.getId();

    injectRepository.saveAll(List.of(injectParent, injectChildren));

    // -- EXECUTE --
    this.job.execute(null);

    // -- ASSERT --
    List<Inject> injectsSaved = injectRepository.findByExerciseId(EXERCISE_ID);
    Optional<Inject> savedInjectParent =
        injectsSaved.stream()
            .filter(inject -> inject.getId().equals(injectParent.getId()))
            .findFirst();
    Optional<Inject> savedInjectChildren =
        injectsSaved.stream()
            .filter(inject -> inject.getId().equals(injectChildren.getId()))
            .findFirst();

    // Checking that only the parent inject has a status
    assertTrue(savedInjectParent.isPresent());
    assertTrue(savedInjectChildren.isPresent());

    assertTrue(savedInjectParent.get().getStatus().isPresent());
    assertTrue(savedInjectChildren.get().getStatus().isEmpty());

    assertNotNull(savedInjectParent.get().getStatus().get().getName());
  }
}
