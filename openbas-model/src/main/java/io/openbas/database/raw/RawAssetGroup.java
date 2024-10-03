package io.openbas.database.raw;

import io.openbas.database.model.Filters;

import java.util.List;

public interface RawAssetGroup {

  public String getAsset_group_id();

  public String getAsset_group_name();

  public List<String> getAsset_ids();

  String getInject_id();

  Filters.FilterGroup getAsset_group_dynamic_filter();

}
