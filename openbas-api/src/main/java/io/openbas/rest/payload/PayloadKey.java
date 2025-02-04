package io.openbas.rest.payload;

import lombok.Data;

@Data
public class PayloadKey {

  private final String externalId;
  private final Integer version;

  public PayloadKey(String externalId, Integer version) {
    this.externalId = externalId;
    this.version = version;
  }

}
