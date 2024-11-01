package io.openbas.rest.exercise.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;
import static io.openbas.config.AppConfig.NOW_FUTURE_MESSAGE;
import static lombok.AccessLevel.NONE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.Getter;

@Data
public class ExerciseCreateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("exercise_name")
  private String name;

  @JsonProperty("exercise_subtitle")
  private String subtitle;

  @Nullable
  @JsonProperty("exercise_category")
  private String category;

  @Nullable
  @JsonProperty("exercise_main_focus")
  private String mainFocus;

  @Nullable
  @JsonProperty("exercise_severity")
  private String severity;

  @Nullable
  @JsonProperty("exercise_description")
  private String description;

  @Schema(nullable = true)
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
