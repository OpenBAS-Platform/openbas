package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import static io.openbas.config.AppConfig.*;
import static lombok.AccessLevel.NONE;

@Getter
@Setter
@Data
public class ExerciseInput {

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

  @Email(message = EMAIL_FORMAT)
  @JsonProperty("exercise_mail_from")
  private String from;

  @JsonProperty("exercise_mails_reply_to")
  private List<String> replyTos;

  @JsonProperty("exercise_message_header")
  private String header;

  @JsonProperty("exercise_message_footer")
  private String footer;

  public Instant getStart() {
    return start != null ? start.truncatedTo(ChronoUnit.MINUTES) : null;
  }


}
