package io.openbas.database.model;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StixRefToExternalRef {

  @JsonProperty("stix_ref")
  private String stixRef;

  @JsonProperty("external_ref")
  private String externalRef;

  public StixRefToExternalRef(String stixRef, String externalRef) {
    this.stixRef = stixRef;
    this.externalRef = externalRef;
  }
}
