package io.openbas.collectors.sentinel.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Incident {

  private String name;
  private IncidentProperties properties;

  @JsonIgnore
  private List<Entity> entities = new ArrayList<>();

  @JsonIgnore
  private List<Alert> alerts = new ArrayList<>();

}
