package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.audit.ModelBaseListener;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.Instant;

import static java.time.Instant.now;

@Data
@Entity
@Table(name = "assets")
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@EntityListeners(ModelBaseListener.class)
public class Asset implements Base {

  @Id
  @Column(name = "asset_id")
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
  @JsonProperty("asset_id")
  private String id;

  @Column(name = "asset_external_id")
  @JsonProperty("asset_external_id")
  private String externalId;

  @NotBlank
  @Column(name = "asset_name")
  @JsonProperty("asset_name")
  private String name;

  @Column(name = "asset_description")
  @JsonProperty("asset_description")
  private String description;

  @Column(name = "asset_created_at")
  @JsonProperty("asset_created_at")
  private Instant createdAt = now();

  @Column(name = "asset_updated_at")
  @JsonProperty("asset_updated_at")
  private Instant updatedAt = now();
}
