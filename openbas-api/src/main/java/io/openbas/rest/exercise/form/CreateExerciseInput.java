package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static io.openbas.config.AppConfig.NOW_FUTURE_MESSAGE;

@Getter
@Setter
public class CreateExerciseInput extends ExerciseInput {

  @Schema(nullable = true)
  @JsonProperty("exercise_start_date")
  @FutureOrPresent(message = NOW_FUTURE_MESSAGE)
  private Instant start;

  public Instant getStart() {
    return start != null ? start.truncatedTo(ChronoUnit.MINUTES) : null;
  }
}
