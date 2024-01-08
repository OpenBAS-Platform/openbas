package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MultiIdDeserializer;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static java.time.Instant.now;

@Data
@Entity
@Table(name = "asset_groups")
@EntityListeners(ModelBaseListener.class)
public class AssetGroup implements Base {

  @Id
  @Column(name = "asset_group_id")
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
  @JsonProperty("asset_group_id")
  private String id;

  @NotBlank
  @Column(name = "asset_group_name")
  @JsonProperty("asset_group_name")
  private String name;

  @Column(name = "asset_group_description")
  @JsonProperty("asset_group_description")
  private String description;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "asset_groups_assets",
      joinColumns = @JoinColumn(name = "asset_group_id"),
      inverseJoinColumns = @JoinColumn(name = "asset_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("asset_group_assets")
  private List<Asset> assets = new ArrayList<>();

  // -- TAG --

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "asset_groups_tags",
      joinColumns = @JoinColumn(name = "asset_group_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("asset_group_tags")
  private List<Tag> tags = new ArrayList<>();

  // -- AUDIT --

  @Column(name = "asset_group_created_at")
  @JsonProperty("asset_group_created_at")
  private Instant createdAt = now();

  @Column(name = "asset_group_updated_at")
  @JsonProperty("asset_group_updated_at")
  private Instant updatedAt = now();
}
