package io.openbas.executors.crowdstrike.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CrowdstrikeError {

  private int code;
  private String message;
}
