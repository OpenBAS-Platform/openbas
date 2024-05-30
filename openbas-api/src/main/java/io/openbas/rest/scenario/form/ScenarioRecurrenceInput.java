package io.openbas.rest.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.Instant;

@Data
public class ScenarioRecurrenceInput {

  @JsonProperty("scenario_recurrence")
  private String recurrence;

  @JsonProperty("scenario_recurrence_start")
  private Instant recurrenceStart;

  @JsonProperty("scenario_recurrence_end")
  private Instant recurrenceEnd;
}
