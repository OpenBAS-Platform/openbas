package io.openbas.database.model;

import java.util.Set;

public class AssetGroupTarget extends InjectTarget {
  public AssetGroupTarget(String id, String name, Set<String> tags) {
    this.setId(id);
    this.setName(name);
    this.setTags(tags);
    this.setTargetType("ASSETS_GROUPS");
  }

  @Override
  protected String getTargetSubtype() {
    return this.getTargetType();
  }
}
