package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Exercise;

public class ExerciseUpdateStatusInput {
    @JsonProperty("exercise_status")
    private Exercise.STATUS status;

    public Exercise.STATUS getStatus() {
        return status;
    }

    public void setStatus(Exercise.STATUS status) {
        this.status = status;
    }
}
