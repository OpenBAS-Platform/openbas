package io.openbas.rest.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import static io.openbas.config.AppConfig.EMAIL_FORMAT;

@Data
public class ScenarioInformationInput {

  @Email(message = EMAIL_FORMAT)
  @JsonProperty("scenario_mail_from")
  @NotBlank
  private String replyTo;

  @JsonProperty("scenario_message_header")
  private String header;

  @JsonProperty("scenario_message_footer")
  private String footer;

}
