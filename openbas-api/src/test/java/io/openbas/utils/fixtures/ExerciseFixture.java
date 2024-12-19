package io.openbas.utils.fixtures;

import static java.time.temporal.ChronoUnit.MINUTES;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Inject;
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

  public static Exercise getExerciseWithInjects() {
    Exercise exercise = getExercise(null);
    Inject inject1 = new Inject();
    inject1.setId("1");
    Inject inject2 = new Inject();
    inject1.setId("2");
    exercise.setInjects(List.of(inject1, inject2));
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
    return createDefaultIncidentResponseExercise(Instant.now());
  }

  public static Exercise createDefaultIncidentResponseExercise(Instant startTime) {
    Exercise exercise = new Exercise();
    exercise.setName("Incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("incident-response");
    exercise.setStatus(ExerciseStatus.SCHEDULED);
    exercise.setStart(startTime);
    return exercise;
  }

  public static Exercise createDefaultAttackExercise() {
    return createDefaultAttackExercise(Instant.now());
  }

  public static Exercise createDefaultAttackExercise(Instant startTime) {
    Exercise exercise = new Exercise();
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.SCHEDULED);
    exercise.setStart(startTime);
    return exercise;
  }

  public static Exercise createRunningAttackExercise() {
    return createRunningAttackExercise(Instant.now());
  }

  public static Exercise createRunningAttackExercise(Instant startTime) {
    Exercise exercise = new Exercise();
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.RUNNING);
    exercise.setStart(startTime);
    return exercise;
  }

  public static Exercise createCanceledAttackExercise() {
    return createCanceledAttackExercise(Instant.now());
  }

  public static Exercise createCanceledAttackExercise(Instant startTime) {
    Exercise exercise = new Exercise();
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.CANCELED);
    exercise.setStart(startTime);
    return exercise;
  }

  public static Exercise createFinishedAttackExercise() {
    return createFinishedAttackExercise(Instant.now());
  }

  public static Exercise createFinishedAttackExercise(Instant startTime) {
    Exercise exercise = new Exercise();
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.FINISHED);
    exercise.setStart(startTime);
    return exercise;
  }

  public static Exercise createPausedAttackExercise() {
    return createPausedAttackExercise(Instant.now());
  }

  public static Exercise createPausedAttackExercise(Instant startTime) {
    Exercise exercise = new Exercise();
    exercise.setCurrentPause(startTime.truncatedTo(MINUTES).minus(1, MINUTES));
    exercise.setName("Draft incident response exercise");
    exercise.setDescription("An incident response exercise for my enterprise");
    exercise.setSubtitle("An incident response exercise");
    exercise.setFrom("exercise@mail.fr");
    exercise.setCategory("attack-scenario");
    exercise.setMainFocus("incident-response");
    exercise.setStatus(ExerciseStatus.PAUSED);
    exercise.setStart(startTime);
    return exercise;
  }
}
