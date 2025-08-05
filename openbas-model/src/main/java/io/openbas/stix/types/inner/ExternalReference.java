package io.openbas.stix.types.inner;

import io.openbas.stix.types.Hashes;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExternalReference {
  private String sourceName;
  private String description;
  private Hashes hashes;
  private String externalId;
}
