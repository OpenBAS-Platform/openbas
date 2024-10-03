package io.openbas.database.raw;

import java.util.List;

public interface RawAssetGroup {

  public String getAsset_group_id();

  public String getAsset_group_name();

  public List<String> getAsset_ids();

  public List<String> getDynamicAsset_ids();

  String getInject_id();

}
