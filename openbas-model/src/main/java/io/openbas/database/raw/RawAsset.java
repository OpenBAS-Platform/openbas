package io.openbas.database.raw;

public interface RawAsset extends RawTarget {

  String getAsset_id();

  String getAsset_type();

  String getAsset_name();

  String getEndpoint_platform();
}
