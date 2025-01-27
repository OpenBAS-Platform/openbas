package io.openbas.utils.fixtures;

import io.openbas.database.model.Endpoint;
import io.openbas.database.raw.RawAsset;

public class RawAssetFixture {

  public static RawAsset createDefaultRawAsset(
      String id, String name, Endpoint.PLATFORM_TYPE platformType) {
    return new RawAsset() {
      @Override
      public String getAsset_id() {
        return id;
      }

      @Override
      public String getAsset_type() {
        return "Endpoint";
      }

      @Override
      public String getAsset_name() {
        return name;
      }

      @Override
      public String getEndpoint_platform() {
        return platformType.name();
      }
    };
  }
}
