package io.openbas.rest.mitigation.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MitigationUpsertInput {

  @JsonProperty("mitigations")
  private List<MitigationCreateInput> mitigations = new ArrayList<>();

}
