package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "regex_groups")
public class RegexGroup implements Base {

  @Id
  @Column(name = "regex_group_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("regex_group_id")
  @NotBlank
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "regex_group_contract_output_element_id")
  @JsonIgnore
  private ContractOutputElement contractOutputElement;

  @Column(name = "regex_group_field")
  @JsonProperty("regex_group_field")
  @NotBlank
  private String field;

  @Column(name = "regex_group_index_values")
  @JsonProperty("regex_group_index_values")
  @NotBlank
  private String indexValues;

  @Column(name = "regex_group_created_at")
  @JsonProperty("regex_group_created_at")
  @NotNull
  private Instant createdAt = now();

  @Column(name = "regex_group_updated_at")
  @JsonProperty("regex_group_updated_at")
  @NotNull
  private Instant updatedAt = now();

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public String getId() {
    return this.id != null ? this.id.toString() : "";
  }

  @Override
  public void setId(String id) {
    this.id = UUID.fromString(id);
  }
}
