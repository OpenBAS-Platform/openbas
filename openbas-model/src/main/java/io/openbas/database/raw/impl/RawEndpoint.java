package io.openbas.database.raw.impl;

import io.openbas.database.model.Endpoint;
import io.openbas.database.raw.RawAsset;
import lombok.Getter;

@Getter
public class RawEndpoint implements RawAsset {

  private final String asset_id;
  private final String asset_type;
  private final String asset_name;
  private final String endpoint_platform;
  private String inject_id;
  private String asset_parent;

  public RawEndpoint(Endpoint endpoint) {
    this.asset_id = endpoint.getId();
    this.asset_type = endpoint.getType();
    this.asset_name = endpoint.getName();
    this.endpoint_platform = endpoint.getPlatform().name();
  }

}
