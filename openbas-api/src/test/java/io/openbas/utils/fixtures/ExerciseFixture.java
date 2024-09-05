package io.openbas.utils.fixtures;

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
        if(exerciseTeams != null){
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

}
