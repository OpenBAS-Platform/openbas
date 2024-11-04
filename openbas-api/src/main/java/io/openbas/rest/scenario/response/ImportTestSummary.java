package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Inject;
import io.openbas.rest.atomic_testing.form.InjectResultOutput;
import io.openbas.utils.AtomicTestingMapper;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class ImportTestSummary {

  @JsonProperty("import_message")
  private List<ImportMessage> importMessage = new ArrayList<>();

  @JsonProperty("total_injects")
  public int totalNumberOfInjects;

  @JsonIgnore private List<Inject> injects = new ArrayList<>();

  @JsonProperty("injects")
  public List<InjectResultOutput> getInjectResults() {
    return injects.stream().map(AtomicTestingMapper::toDtoWithTargetResults).toList();
  }
}
