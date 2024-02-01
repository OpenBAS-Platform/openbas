package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;
import static io.openex.config.AppConfig.NOW_FUTURE_MESSAGE;
import static lombok.AccessLevel.NONE;

@Data
public class ExerciseCreateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("exercise_name")
  private String name;

  @JsonProperty("exercise_subtitle")
  private String subtitle;

  @JsonProperty("exercise_description")
  private String description;

  @JsonProperty("exercise_start_date")
  @FutureOrPresent(message = NOW_FUTURE_MESSAGE)
  @Getter(NONE)
  private Instant start;

  @JsonProperty("exercise_tags")
  private List<String> tagIds = new ArrayList<>();

  public Instant getStart() {
    return start != null ? start.truncatedTo(ChronoUnit.MINUTES) : null;
  }

}
