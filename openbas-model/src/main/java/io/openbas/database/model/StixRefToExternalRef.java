package io.openbas.database.model;


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
