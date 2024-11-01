package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InjectDocumentInput {

  @JsonProperty("document_id")
  private String documentId;

  @JsonProperty("document_attached")
  private boolean attached = true;
}
