package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExecutionPayloadDocument {

  @JsonProperty("document_id")
  @NotBlank
  private String id;

  @JsonProperty("document_name")
  @NotBlank
  private String name;

  // Usefully to avoid migration
  @JsonCreator
  public ExecutionPayloadDocument(
      @JsonProperty("document_id") String id, @JsonProperty("document_name") String name) {
    this.id = id;
    this.name = name;
  }

  public ExecutionPayloadDocument(Document document) {
    this.id = document.getId();
    this.name = document.getName();
  }
}
