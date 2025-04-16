package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;

public class AssetGroupTarget extends InjectTarget {
  public AssetGroupTarget(String id, String name, Set<String> tags) {
    this.setId(id);
    this.setName(name);
    this.setTags(tags);
    this.setTargetType("ASSETS_GROUPS");
  }

  @JsonProperty("target_subtype")
  protected String getTargetSubtype() {
    return "ASSETS_GROUPS";
  }
}
