package io.openbas.database.raw;

import java.time.Instant;

public interface RawAsset {

  String getAsset_id();

  String getAsset_type();

  String getAsset_name();

  String getEndpoint_platform();

  Instant getAsset_created_at();

  Instant getAsset_updated_at();
}
