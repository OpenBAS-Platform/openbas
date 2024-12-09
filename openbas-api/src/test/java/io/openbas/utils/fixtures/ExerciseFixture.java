package io.openbas.utils.fixtures;

import static java.time.Instant.now;
import static java.time.temporal.ChronoUnit.MINUTES;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Team;
import java.time.Instant;
import java.util.List;

public class ExerciseFixture {

  public static final String EXERCISE_NAME = "Exercise test";

  public static Exercise getExercise() {
    return getExercise(null);
  }

  public static Exercise getExercise(List<Team> exerciseTeams) {
    Exercise exercise = new Exercise();
    exercise.setName(EXERCISE_NAME);
    if (exerciseTeams != null) {
      exercise.setTeams(exerciseTeams);
    }
    return exercise;
  }

  public static Exercise createDefaultCrisisExercise() {
    Exercise exercise = new Exercise();
    exercise.setName("Crisis exercise");
    exercise.setDescription("A crisis exercise for my enterprise");
    exercise.setSubtitle("A crisis exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("crisis-communication");
    return exercise;
  }

  public static Exercise createDefaultIncidentResponseExercise() {
    Exercise exercise = new Exercise();
    exercise.setName("Incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("incident-response");
    exercise.setStatus(ExerciseStatus.SCHEDULED);
    exercise.setStart(Instant.now());
    return exercise;
  }

  public static Exercise createDefaultAttackExercise() {
    Exercise exercise = new Exercise();
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.SCHEDULED);
    exercise.setStart(Instant.now());
    return exercise;
  }

  public static Exercise createRunningAttackExercise() {
    Exercise exercise = new Exercise();
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.RUNNING);
    exercise.setStart(Instant.now());
    return exercise;
  }

  public static Exercise createCanceledAttackExercise() {
    Exercise exercise = new Exercise();
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.CANCELED);
    exercise.setStart(Instant.now());
    return exercise;
  }

  public static Exercise createFinishedAttackExercise() {
    Exercise exercise = new Exercise();
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.FINISHED);
    exercise.setStart(Instant.now());
    return exercise;
  }

  public static Exercise createPausedAttackExercise() {
    Exercise exercise = new Exercise();
    exercise.setCurrentPause(now().truncatedTo(MINUTES).minus(1, MINUTES));
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.PAUSED);
    exercise.setStart(Instant.now());
    return exercise;
  }
}
