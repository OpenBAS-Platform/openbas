package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Inject;
import io.openbas.rest.atomic_testing.form.InjectResultDTO;
import io.openbas.utils.AtomicTestingMapper;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class ImportTestSummary {

  private final AtomicTestingMapper atomicTestingMapper;

  @JsonProperty("import_message")
  private List<ImportMessage> importMessage = new ArrayList<>();

  @JsonProperty("total_injects")
  public int totalNumberOfInjects;

  @JsonIgnore private List<Inject> injects = new ArrayList<>();

  @JsonProperty("injects")
  public List<InjectResultDTO> getInjectResults() {
    return injects.stream().map(atomicTestingMapper::toDtoWithTargetResults).toList();
  }
}
