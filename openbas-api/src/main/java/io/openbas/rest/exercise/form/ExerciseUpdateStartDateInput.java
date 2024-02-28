package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.FutureOrPresent;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static io.openbas.config.AppConfig.*;

public class ExerciseUpdateStartDateInput {
    @JsonProperty("exercise_start_date")
    @FutureOrPresent(message = NOW_FUTURE_MESSAGE)
    private Instant start;

    public Instant getStart() {
        return start != null ? start.truncatedTo(ChronoUnit.MINUTES) : null;
    }

    public void setStart(Instant start) {
        this.start = start;
    }
}
