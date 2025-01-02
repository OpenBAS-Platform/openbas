package io.openbas.executors.crowdstrike.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openbas.executors.tanium.model.Os;
import io.openbas.executors.tanium.model.Processor;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CrowdStrikeSession {

  private String session_id;
  private String device_id;
}
