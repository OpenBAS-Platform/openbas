package io.openbas.rest.scenario.form;

import static io.openbas.config.AppConfig.EMAIL_FORMAT;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Data;

@Data
public class ScenarioInformationInput {

  @Email(message = EMAIL_FORMAT)
  @JsonProperty("scenario_mail_from")
  @NotBlank
  private String from;

  @JsonProperty("scenario_mails_reply_to")
  private List<String> replyTos;

  @JsonProperty("scenario_message_header")
  private String header;

  @JsonProperty("scenario_message_footer")
  private String footer;
}
