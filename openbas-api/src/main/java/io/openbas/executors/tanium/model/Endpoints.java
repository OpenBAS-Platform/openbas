package io.openbas.executors.tanium.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Endpoints {

  private EdgesEndpoints endpoints;
}
