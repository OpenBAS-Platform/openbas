package io.openbas.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;
import java.util.List;

import static io.openbas.config.AppConfig.EMAIL_FORMAT;

@Data
public class ScenarioRecurrenceInput {

  @JsonProperty("scenario_recurrence")
  private String recurrence;

  @JsonProperty("scenario_recurrence_start")
  private Instant recurrenceStart;

  @JsonProperty("scenario_recurrence_end")
  private Instant recurrenceEnd;
}
