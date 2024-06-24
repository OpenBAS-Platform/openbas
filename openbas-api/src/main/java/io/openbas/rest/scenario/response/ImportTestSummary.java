package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Inject;
import lombok.Data;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
public class ImportTestSummary {

  @JsonProperty("import_message")
  private List<ImportMessage> importMessage = new ArrayList<>();

  @JsonProperty("injects")
  private List<Inject> injects = new ArrayList<>();

  @JsonIgnore
  private Instant scenarioUpdatedDate;

}
