package io.openbas.stix.types.inner;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.stix.types.Hashes;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public class ExternalReference {
  @JsonProperty("source_name")
  private String sourceName;

  @JsonProperty("description")
  private String description;

  @JsonProperty("hashes")
  private Hashes hashes;

  @JsonProperty("url")
  private String url;

  @JsonProperty("external_id")
  private String externalId;
}
