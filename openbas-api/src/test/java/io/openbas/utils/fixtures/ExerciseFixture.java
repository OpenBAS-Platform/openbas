package io.openbas.utils.fixtures;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Team;

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
}
