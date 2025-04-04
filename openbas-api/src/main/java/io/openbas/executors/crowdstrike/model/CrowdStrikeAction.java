package io.openbas.executors.crowdstrike.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openbas.database.model.Agent;
import java.util.List;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CrowdStrikeAction {

  private List<Agent> agents;
  private String scriptName;
  private String commandEncoded;
}
