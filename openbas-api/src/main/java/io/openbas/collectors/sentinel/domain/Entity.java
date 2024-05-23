package io.openbas.collectors.sentinel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Entity {

  private String kind;
  private HostProperties properties;

  public String getHostName() {
    return this.getProperties().getHostName();
  }

  public String getCommandLine() {
    return this.getProperties().getCommandLine();
  }

}
