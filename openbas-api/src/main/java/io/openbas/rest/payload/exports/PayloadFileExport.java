package io.openbas.rest.payload.exports;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Document;
import io.openbas.database.model.Payload;
import io.openbas.database.model.Tag;
import io.openbas.export.FileExportBase;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Getter
@JsonInclude(NON_NULL)
public class PayloadFileExport extends FileExportBase {
  @JsonProperty("payload_information")
  private Payload payload;

  @JsonProperty("payload_tags")
  private List<Tag> getTags() {
    List<Tag> allTags = new ArrayList<>();
    allTags.addAll(this.payload.getTags().stream().toList());
    allTags.addAll(this.payload.getAttachedDocument().orElseThrow().getTags().stream().toList());
    return allTags;
  }

  private PayloadFileExport(Payload payload, ObjectMapper objectMapper) {
    super(objectMapper, null, null);
    this.payload = payload;
  }

  public static PayloadFileExport fromPayload(Payload payload, ObjectMapper objectMapper) {
    return new PayloadFileExport(payload, objectMapper);
  }
}
