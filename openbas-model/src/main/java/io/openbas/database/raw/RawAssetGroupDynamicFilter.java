package io.openbas.database.raw;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Filters;

import java.util.List;

public interface RawAssetGroupDynamicFilter {

  default Filters.FilterGroup getAssetGroupDynamicFilter() {
    ObjectMapper objectMapper = new ObjectMapper();
    try {
      return objectMapper.readValue(getAsset_group_dynamic_filter(), Filters.FilterGroup.class);
    } catch (JsonProcessingException e) {
      return null;
    }
  }

  String getAsset_group_id();

  String getAsset_group_dynamic_filter();
}
