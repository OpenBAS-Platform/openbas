package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.audit.ModelBaseListener;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

import static java.time.Instant.now;
import static org.apache.commons.lang3.StringUtils.isBlank;

@Builder
@Data
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@Entity
@EntityListeners(ModelBaseListener.class)
@Table(name = "data_mapper_representations")
public class DataMapperRepresentation implements Base {

  @Id
  @NotBlank
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
  @Column(name = "data_mapper_representation_id")
  @JsonProperty("data_mapper_representation_id")
  private String id;

  @NotBlank
  @Column(name = "data_mapper_representation_name")
  @JsonProperty("data_mapper_representation_name")
  private String name;

  @NotNull
  @Column(name = "data_mapper_representation_clazz")
  @JsonProperty("data_mapper_representation_clazz")
  private Class<? extends Base> clazz;

  @Singular
  @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
  @JoinColumn(name = "data_mapper_representation_id")
  @JsonProperty("data_mapper_representation_properties")
  private List<DataMapperRepresentationProperty> properties;

  @Builder.Default
  @NotNull
  @Column(name = "data_mapper_representation_created_at")
  @JsonProperty("data_mapper_representation_created_at")
  private Instant createdAt = now();

  @Builder.Default
  @NotNull
  @Column(name = "data_mapper_representation_updated_at")
  @JsonProperty("data_mapper_representation__updated_at")
  private Instant updatedAt = now();

  // -- VALIDATION --

  public static DataMapperRepresentationBuilder builder() {
    return new ValidationBuilder();
  }

  private static class ValidationBuilder extends DataMapperRepresentationBuilder {

    public DataMapperRepresentation build() {
      if (isBlank(super.name)) {
        throw new RuntimeException("Name must not be empty");
      }
      if (super.clazz == null) {
        throw new RuntimeException("Clazz must not be null");
      }
      if (super.properties == null || super.properties.isEmpty()) {
        throw new RuntimeException("Properties must not be empty");
      }

      return super.build();
    }
  }

}
