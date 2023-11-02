package io.openex.helper;

import io.openex.database.model.*;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.repository.UserRepository;
import io.openex.execution.ExecutableInject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.List;

import static io.openex.database.model.Exercise.STATUS.RUNNING;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
public class InjectHelperTest {

  public static final String USER_EMAIL = "test@gmail.com";
  @Autowired
  private InjectHelper injectHelper;

  @Autowired
  private AudienceRepository audienceRepository;

  @Autowired
  private ExerciseRepository exerciseRepository;

  @Autowired
  private InjectRepository injectRepository;

  @Autowired
  private UserRepository userRepository;

  @DisplayName("Retrieve simple inject to run")
  @Test
  void injectsToRunTest() {
    // -- PREPARE --
    Exercise exercise = new Exercise();
    exercise.setStart(Instant.now());
    exercise.setStatus(RUNNING);
    Exercise exerciseSaved = this.exerciseRepository.save(exercise);

    User user = new User();
    user.setEmail(USER_EMAIL);
    this.userRepository.save(user);

    Audience audience = new Audience();
    audience.setName("My audience");
    audience.setEnabled(true);
    audience.setUsers(List.of(user));
    audience.setExercise(exerciseSaved);
    this.audienceRepository.save(audience);

    // Executable Inject
    Inject inject = new Inject();
    inject.setEnabled(true);
    InjectStatus status = new InjectStatus();
    inject.setStatus(status);
    inject.setExercise(exerciseSaved);
    inject.setAudiences(List.of(audience));
    this.injectRepository.save(inject);

    // -- EXECUTE --
    List<ExecutableInject> executableInjects = this.injectHelper.getInjectsToRun();

    // -- ASSERT --
    assertFalse(executableInjects.isEmpty());
    ExecutableInject executableInject = executableInjects.get(0);
    assertEquals(1, executableInject.getAudienceSize());
    assertEquals(1, executableInject.getUsers().size());
    assertEquals(USER_EMAIL, executableInject.getUsers().get(0).getUser().getEmail());
  }

}
