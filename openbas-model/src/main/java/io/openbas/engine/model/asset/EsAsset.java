package io.openbas.engine.model.asset;

import io.openbas.annotation.EsQueryable;
import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.database.model.AssetType;
import io.openbas.engine.model.EsBase;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "asset", label = "Asset")
public class EsAsset extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */
  /* Except relationships, they should have same name on every model! */

  // -- ASSET GENERIC
  @Queryable(
      label = "asset type",
      filterable = true,
      dynamicValues = true,
      refEnumClazz = AssetType.class)
  @EsQueryable(keyword = true)
  private String asset_type;

  @Queryable(label = "asset description", filterable = true)
  @EsQueryable(keyword = true)
  private String asset_description;

  @Queryable(label = "asset external reference", filterable = true)
  @EsQueryable(keyword = true)
  private String asset_external_reference;

  // -- ENDPOINT SPECIFIC --

  @Queryable(label = "endpoint ips", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> endpoint_ips;

  @Queryable(label = "endpoint hostname", filterable = true)
  @EsQueryable(keyword = true)
  private String endpoint_hostname;

  @Queryable(label = "endpoint platform", filterable = true)
  @EsQueryable(keyword = true)
  private String endpoint_platform;

  @Queryable(label = "endpoint arch", filterable = true)
  @EsQueryable(keyword = true)
  private String endpoint_arch;

  @Queryable(label = "endpoint mac addresses", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> endpoint_mac_addresses;

  @Queryable(label = "endpoint seen ip", filterable = true)
  @EsQueryable(keyword = true)
  private String endpoint_seen_ip;

  // -- SECURITY PLATFORM SPECIFIC
  @Queryable(label = "security platform type", filterable = true)
  @EsQueryable(keyword = true)
  private String security_platform_type;

  // -- SIDE --

  @Queryable(label = "findings", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_findings_side; // Must finish by _side

  @Queryable(label = "tags", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_tags_side; // Must finish by _side
}
