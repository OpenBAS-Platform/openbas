package io.openbas.rest.exercise.form;

import static io.openbas.config.AppConfig.*;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ExerciseUpdateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("exercise_name")
  private String name;

  @JsonProperty("exercise_subtitle")
  private String subtitle;

  @JsonProperty("exercise_description")
  private String description;

  @JsonProperty("exercise_category")
  private String category;

  @JsonProperty("exercise_main_focus")
  private String mainFocus;

  @JsonProperty("exercise_severity")
  private String severity;

  @Email(message = EMAIL_FORMAT)
  @JsonProperty("exercise_mail_from")
  private String from;

  @JsonProperty("exercise_mails_reply_to")
  private List<String> replyTos;

  @JsonProperty("exercise_message_header")
  private String header;

  @JsonProperty("exercise_message_footer")
  private String footer;

  @JsonProperty("exercise_tags")
  private List<String> tagIds = new ArrayList<>();
}
