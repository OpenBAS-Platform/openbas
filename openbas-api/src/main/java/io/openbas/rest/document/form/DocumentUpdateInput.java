package io.openbas.rest.document.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class DocumentUpdateInput {

  @JsonProperty("document_description")
  private String description;

  @JsonProperty("document_tags")
  private List<String> tagIds;

  @JsonProperty("document_exercises")
  private List<String> exerciseIds = new ArrayList<>();

  @JsonProperty("document_scenarios")
  private List<String> scenarioIds = new ArrayList<>();

}
