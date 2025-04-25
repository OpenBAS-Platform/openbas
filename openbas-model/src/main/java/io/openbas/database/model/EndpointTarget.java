package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import java.util.Optional;
import java.util.Set;

public class EndpointTarget extends InjectTarget {
  public EndpointTarget(
      String id, String name, Set<String> tags, String subType, Set<String> asset_groups) {
    this.setId(id);
    this.setName(name);
    this.setTags(tags);
    this.setTargetType("ASSETS");
    this.subType = subType;
  }

  @JsonIgnore private final String subType;

  @JsonProperty("target_asset_groups")
  @Queryable(searchable = true, filterable = true)
  private Set<String> assetGroups;

  @Override
  protected String getTargetSubtype() {
    return Optional.ofNullable(this.subType).orElse(Endpoint.PLATFORM_TYPE.Unknown.name());
  }
}
