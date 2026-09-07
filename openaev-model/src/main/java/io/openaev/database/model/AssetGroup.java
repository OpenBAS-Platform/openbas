package io.openaev.database.model;

import static java.time.Instant.now;
import static lombok.AccessLevel.NONE;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import io.openaev.annotation.ControlledUuidGeneration;
import io.openaev.annotation.Queryable;
import io.openaev.database.audit.ModelBaseListener;
import io.openaev.database.audit.TenantBaseListener;
import io.openaev.database.model.Filters.FilterGroup;
import io.openaev.helper.MultiIdListSerializer;
import io.openaev.helper.MultiIdSetSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.*;
import lombok.Data;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table(name = "asset_groups")
@EntityListeners({ModelBaseListener.class, TenantBaseListener.class})
@NamedEntityGraphs({
  @NamedEntityGraph(
      name = "AssetGroup.tags-assets",
      attributeNodes = {@NamedAttributeNode("tags"), @NamedAttributeNode("assets")})
})
public class AssetGroup implements TenantBase {

  // asset_groups is on multi-tenancy v2 (#6435).
  //
  // The v1 @Filter is GONE and must not come back: reads are scoped by TenantStatementInspector
  // from app.current_tenants, and re-adding the filter would AND a thread-local predicate onto the
  // rewritten one, silently emptying every result reached without TenantContext, the header route
  // first.
  //
  // TenantBaseListener is KEPT, deliberately, and this diverges from the activate-tenant-table
  // runbook, which says to remove it. Of the eight entities activated before this one, seven keep a
  // tenant listener: collectors, executors and injectors carry TenantIdBaseListener, while
  // import_mappers, kill_chain_phases, mitigations and cwes carry TenantBaseListener. Only
  // security_coverages, the most recent, has none, and its fixtures were built to set the tenant
  // themselves from the start. Removing it here would require fixing every fixture and composer
  // that relies on it to stamp tenant_id (19 tests failed when it was tried), which is not a
  // minimal go-live diff and is exactly the "just one more fix" the runbook's Phase 6 warns
  // against.
  //
  // It is not an isolation risk: the listener only stamps tenant_id on write, it never filters a
  // read. And it is now redundant rather than load-bearing, because every create path resolves and
  // sets the tenant explicitly (AssetGroupService.createAssetGroup takes it as a parameter).
  // Removing the listener platform-wide is its own cleanup, once TenantContext goes.

  @Id
  @ControlledUuidGeneration
  @Column(name = "asset_group_id")
  @JsonProperty("asset_group_id")
  @NotBlank
  private String id;

  @Column(name = "asset_group_name")
  @JsonProperty("asset_group_name")
  @Queryable(filterable = true, searchable = true, sortable = true)
  @NotBlank
  private String name;

  @Column(name = "asset_group_description")
  @JsonProperty("asset_group_description")
  @Queryable(filterable = true, sortable = true)
  private String description;

  @Column(name = "asset_group_external_reference")
  @JsonProperty("asset_group_external_reference")
  private String externalReference;

  @ManyToOne
  @JoinColumn(name = "tenant_id", updatable = false, nullable = false)
  @JsonIgnore
  private Tenant tenant;

  // -- ASSET --

  @Type(JsonType.class)
  @Column(name = "asset_group_dynamic_filter")
  @JsonProperty("asset_group_dynamic_filter")
  @NotNull
  private FilterGroup dynamicFilter = FilterGroup.defaultFilterGroup();

  @Schema(implementation = String[].class)
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "asset_groups_assets",
      joinColumns = @JoinColumn(name = "asset_group_id"),
      inverseJoinColumns = @JoinColumn(name = "asset_id"))
  @JsonSerialize(using = MultiIdListSerializer.class)
  @JsonProperty("asset_group_assets")
  private List<Asset> assets = new ArrayList<>();

  @Getter(NONE)
  @Transient
  private List<Asset> dynamicAssets = new ArrayList<>();

  // Getter is Mandatory when we use @Transient annotation
  @Schema(implementation = String[].class)
  @JsonSerialize(using = MultiIdListSerializer.class)
  @JsonProperty("asset_group_dynamic_assets")
  public List<Asset> getDynamicAssets() {
    return this.dynamicAssets;
  }

  // -- TAG --

  @Schema(implementation = String[].class)
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "asset_groups_tags",
      joinColumns = @JoinColumn(name = "asset_group_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdSetSerializer.class)
  @JsonProperty("asset_group_tags")
  @Queryable(filterable = true, dynamicValues = true, path = "tags.id")
  private Set<Tag> tags = new HashSet<>();

  // -- INJECT --

  @Schema(implementation = String[].class)
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "injects_asset_groups",
      joinColumns = @JoinColumn(name = "asset_group_id"),
      inverseJoinColumns = @JoinColumn(name = "inject_id"))
  @JsonProperty("asset_group_injects")
  @JsonIgnore
  @Queryable(filterable = true, dynamicValues = true, path = "injects.id")
  private List<Inject> injects = new ArrayList<>();

  // -- AUDIT --

  @Column(name = "asset_group_created_at")
  @JsonProperty("asset_group_created_at")
  @NotNull
  @CreationTimestamp
  private Instant createdAt = now();

  @Column(name = "asset_group_updated_at")
  @JsonProperty("asset_group_updated_at")
  @NotNull
  @UpdateTimestamp
  private Instant updatedAt = now();

  @Getter(onMethod_ = @JsonIgnore)
  @Transient
  private final ResourceType resourceType = ResourceType.ASSET_GROUP;

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
