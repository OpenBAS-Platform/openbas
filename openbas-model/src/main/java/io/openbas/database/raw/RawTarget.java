package io.openbas.database.raw;

import static io.openbas.database.raw.TargetType.*;

public interface RawTarget {

  default String getId() {
    if (this instanceof RawAsset) {
      return ((RawAsset) this).getAsset_id();
    } else if (this instanceof RawAssetGroup) {
      return ((RawAssetGroup) this).getAsset_group_id();
    } else if (this instanceof RawTeam) {
      return ((RawTeam) this).getTeam_id();
    }
    return "Unknown Id";
  }

  default String getName() {
    if (this instanceof RawAsset) {
      return ((RawAsset) this).getAsset_name();
    } else if (this instanceof RawAssetGroup) {
      return ((RawAssetGroup) this).getAsset_group_name();
    } else if (this instanceof RawTeam) {
      return ((RawTeam) this).getTeam_name();
    }
    return "Unknown Name";
  }

  default TargetType getType() {
    if (this instanceof RawAsset) {
      return ASSETS;
    } else if (this instanceof RawAssetGroup) {
      return ASSETS_GROUPS;
    } else if (this instanceof RawTeam) {
      return TEAMS;
    }
    return null;
  }
}
