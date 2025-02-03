package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InjectExportRequestInput {
  @JsonProperty("injects")
  private List<InjectExportTarget> injects;

  @JsonIgnore
  public List<String> getTargetsIds() {
    if (injects == null) {
      return List.of();
    }
    return injects.stream().map(InjectExportTarget::getId).toList();
  }
}
