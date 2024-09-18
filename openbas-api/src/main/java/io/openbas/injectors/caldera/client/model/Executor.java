package io.openbas.injectors.caldera.client.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Executor {

  private String name;
  private String platform;
  private String command;
  private List<String> cleanup;
}
