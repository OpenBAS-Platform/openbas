package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import static io.openbas.config.AppConfig.*;

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

    @Email(message = EMAIL_FORMAT)
    @JsonProperty("exercise_mail_from")
    private String from;

    @JsonProperty("exercise_mails_reply_to")
    private List<String> replyTos;

    @JsonProperty("exercise_message_header")
    private String header;

    @JsonProperty("exercise_message_footer")
    private String footer;

}
