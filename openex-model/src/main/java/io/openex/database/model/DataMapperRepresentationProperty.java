package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.audit.ModelBaseListener;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.Instant;

import static java.time.Instant.now;

@Data
@NoArgsConstructor
@Entity
@EntityListeners(ModelBaseListener.class)
@Table(name = "data_mapper_representation_properties")
public class DataMapperRepresentationProperty implements Base {

  @Id
  @NotBlank
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
  @Column(name = "data_mapper_representation_property_id")
  @JsonProperty("data_mapper_representation_property_id")
  private String id;

  @NotBlank
  @Column(name = "data_mapper_representation_property_name")
  @JsonProperty("data_mapper_representation_property_name")
  private String propertyName;

  @Column(name = "data_mapper_representation_property_column_name")
  @JsonProperty("data_mapper_representation_property_column_name")
  private String columnName;

  @Column(name = "data_mapper_representation_property_based_on")
  @JsonProperty("data_mapper_representation_property_based_on")
  private String basedOn;

  @NotNull
  @Column(name = "data_mapper_representation_property_created_at")
  @JsonProperty("data_mapper_representation_property_created_at")
  private Instant createdAt = now();

  @NotNull
  @Column(name = "data_mapper_representation_property_updated_at")
  @JsonProperty("data_mapper_representation_property_updated_at")
  private Instant updatedAt = now();

  public DataMapperRepresentationProperty(@NotBlank final String propertyName) {
    this.propertyName = propertyName;
  }

  public DataMapperRepresentationProperty(
      @NotBlank final String propertyName,
      @NotNull final String basedOn) {
    this.propertyName = propertyName;
    this.basedOn = basedOn;
  }
}
