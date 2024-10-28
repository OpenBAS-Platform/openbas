package io.openbas.injects;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectorContractRepository;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class InjectCrudTest {

  @Autowired private InjectRepository injectRepository;

  @Autowired private ExerciseRepository exerciseRepository;

  @Autowired private InjectorContractRepository injectorContractRepository;

  @DisplayName("Test inject creation with non null depends duration")
  @Test
  void createInjectSuccess() {
    // -- PREPARE --
    Exercise exercise = new Exercise();
    exercise.setName("Exercise name");
    exercise.setFrom("test@test.com");
    exercise.setReplyTos(List.of("test@test.com"));
    Exercise exerciseCreated = this.exerciseRepository.save(exercise);
    Inject inject = new Inject();
    inject.setTitle("test");
    inject.setInjectorContract(
        this.injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
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
