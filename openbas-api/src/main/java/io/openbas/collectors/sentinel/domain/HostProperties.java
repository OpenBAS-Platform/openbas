package io.openbas.collectors.sentinel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HostProperties {

  private String hostName;
  private String osFamily;
  private String osVersion;
  private String friendlyName;
  private String commandLine;

}
