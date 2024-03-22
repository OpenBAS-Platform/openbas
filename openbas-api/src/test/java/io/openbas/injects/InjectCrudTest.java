package io.openbas.injects;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.TransactionSystemException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import java.util.List;
import java.util.Set;

import static io.openbas.injects.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.injects.email.EmailContract.TYPE;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class InjectCrudTest {

  @Autowired
  private InjectRepository injectRepository;

  @Autowired
  private ExerciseRepository exerciseRepository;

  @DisplayName("Test inject creation with null depends duration")
  @Test
  void createInjectFailed() {
    // -- PREPARE --
    Exercise exercise = new Exercise();
    exercise.setName("Exercice name");
    exercise.setFrom("test@test.com");
    exercise.setReplyTos(List.of("test@test.com"));
    Exercise exerciseCreated = this.exerciseRepository.save(exercise);
    Inject inject = new Inject();
    inject.setExercise(exerciseCreated);

    // -- EXECUTE --
    try {
      this.injectRepository.save(inject);
    } catch (Exception e) {
      assertEquals(TransactionSystemException.class, e.getClass());
      Throwable constraintViolationException = e.getCause().getCause();
      assertEquals(ConstraintViolationException.class, constraintViolationException.getClass());
      Set<ConstraintViolation<?>> constraintViolations = ((ConstraintViolationException) constraintViolationException)
          .getConstraintViolations();
      ConstraintViolation<?> constraintViolation = constraintViolations.iterator().next();
      assertTrue(constraintViolation.getPropertyPath().toString().contains("dependsDuration"));
      assertTrue(constraintViolation.getMessage().contains("must not be null"));
    }
  }

  @DisplayName("Test inject creation with non null depends duration")
  @Test
  void createInjectSuccess() {
    // -- PREPARE --
    Exercise exercise = new Exercise();
    exercise.setName("Exercice name");
    exercise.setFrom("test@test.com");
    exercise.setReplyTos(List.of("test@test.com"));
    Exercise exerciseCreated = this.exerciseRepository.save(exercise);
    Inject inject = new Inject();
    inject.setTitle("test");
    inject.setType(TYPE);
    inject.setContract(EMAIL_DEFAULT);
    inject.setExercise(exerciseCreated);
    inject.setDependsDuration(0L);

    // -- EXECUTE --
    Inject injectCreated = this.injectRepository.save(inject);
    assertNotNull(injectCreated);

    // -- CLEAN --
    this.exerciseRepository.delete(exercise);
    this.injectRepository.delete(inject);
  }

}
