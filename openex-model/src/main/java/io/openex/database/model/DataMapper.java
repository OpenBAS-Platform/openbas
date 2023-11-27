package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.audit.ModelBaseListener;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.time.Instant.now;
import static org.apache.commons.lang3.StringUtils.isBlank;

@Builder
@Data
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@Entity
@EntityListeners(ModelBaseListener.class)
@Table(name = "data_mappers")
public class DataMapper implements Base {

  @Getter
  public enum SEPARATOR {
    COMMA(","),
    SEMICOLON(";");

    private final String value;

    SEPARATOR(@NotNull final String value) {
      this.value = value;
    }
  }

  @Getter
  public enum TYPE {
    PLAYER,
    AUDIENCE;

    public static TYPE findByValue(@NotBlank final String value) {
      return Arrays.stream(values())
          .filter(type -> type.name().equalsIgnoreCase(value))
          .findFirst()
          .orElseThrow(() -> new IllegalArgumentException("This Data Mapper Type is not supported : " + value));
    }
  }

  @Id
  @NotBlank
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
  @Column(name = "data_mapper_id")
  @JsonProperty("data_mapper_id")
  private String id;

  @NotBlank
  @Column(name = "data_mapper_name")
  @JsonProperty("data_mapper_name")
  private String name;

  @NotNull
  @Column(name = "data_mapper_type")
  @JsonProperty("data_mapper_type")
  private TYPE type;

  @Column(name = "data_mapper_has_header")
  @JsonProperty("data_mapper_has_header")
  private boolean hasHeader;

  @NotNull
  @Column(name = "data_mapper_separator")
  @JsonProperty("data_mapper_separator")
  private SEPARATOR separator;

  @Singular
  @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
  @JoinColumn(name = "data_mapper_id")
  @JsonProperty("data_mapper_representations")
  private List<DataMapperRepresentation> representations;

  @Builder.Default
  @NotNull
  @Column(name = "data_mapper_created_at")
  @JsonProperty("data_mapper_created_at")
  private Instant createdAt = now();

  @Builder.Default
  @NotNull
  @Column(name = "data_mapper_updated_at")
  @JsonProperty("data_mapper_updated_at")
  private Instant updatedAt = now();

  // -- VALIDATION --

  public static DataMapperBuilder builder() {
    return new ValidationBuilder();
  }

  private static class ValidationBuilder extends DataMapperBuilder {

    public DataMapper build() {
      if (isBlank(super.name)) {
        throw new RuntimeException("Name must not be empty");
      }
      if (super.type == null) {
        throw new RuntimeException("Type must not be null");
      }
      if (super.separator == null) {
        throw new RuntimeException("Separator must not be null");
      }
      if (super.representations == null || super.representations.isEmpty()) {
        throw new RuntimeException("Representations must not be empty");
      }
      Map<String, Long> representationNames = super.representations.stream()
          .map(DataMapperRepresentation::getName)
          .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
      if (representationNames.values().stream().anyMatch((v) -> v > 1)) {
        throw new RuntimeException("Representations must have a unique name");
      }

      return super.build();
    }
  }

}
