package io.openex.service;

import io.openex.database.model.Exercise;
import io.openex.database.model.InjectExpectation;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectExpectationRepository;
import io.openex.rest.exercise.form.ExpectationUpdateInput;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.List;

import static io.openex.database.model.Exercise.STATUS.SCHEDULED;
import static io.openex.database.model.InjectExpectation.EXPECTATION_TYPE.MANUAL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ExerciseExpectationServiceTest {

  public static final String EXPECTATION_NAME = "The animation team can validate the audience reaction";
  @Autowired
  private ExerciseExpectationService exerciseExpectationService;

  @Autowired
  private ExerciseRepository exerciseRepository;
  @Autowired
  private InjectExpectationRepository injectExpectationRepository;

  static String EXERCISE_ID;

  @BeforeAll
  void beforeAll() {
    Exercise exercise = new Exercise();
    exercise.setName("Exercice name");
    exercise.setStatus(SCHEDULED);
    exercise.setStart(Instant.now());
    Exercise exerciseCreated = this.exerciseRepository.save(exercise);
    EXERCISE_ID = exerciseCreated.getId();
    InjectExpectation expectation = new InjectExpectation();
    expectation.setType(MANUAL);
    expectation.setName(EXPECTATION_NAME);
    expectation.setExpectedScore(10);
    expectation.setExercise(exercise);
    this.injectExpectationRepository.save(expectation);
  }

  @DisplayName("Retrieve inject expectations")
  @Test
  void retrieveInjectExpectations() {
    List<InjectExpectation> expectations = this.exerciseExpectationService.injectExpectations(EXERCISE_ID);
    assertNotNull(expectations);

    assertEquals(EXPECTATION_NAME, expectations.get(0).getName());
  }

  @DisplayName("Update inject expectation")
  @Test
  void updateInjectExpectation() {
    // -- PREPARE --
    List<InjectExpectation> expectations = this.exerciseExpectationService.injectExpectations(EXERCISE_ID);
    assertNotNull(expectations);
    String id = expectations.get(0).getId();

    // -- EXECUTE --
    ExpectationUpdateInput input = new ExpectationUpdateInput();
    input.setScore(7);
    InjectExpectation expectation = this.exerciseExpectationService.updateInjectExpectation(id, input);

    // -- ASSERT --
    assertNotNull(expectation);
    assertEquals(7, expectation.getScore());
  }
}
