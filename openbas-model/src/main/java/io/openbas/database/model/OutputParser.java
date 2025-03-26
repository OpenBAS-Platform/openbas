package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "output_parsers")
public class OutputParser implements Base {

  @Id
  @Column(name = "output_parser_id")
  @GeneratedValue
  @UuidGenerator
  @JsonProperty("output_parser_id")
  @NotNull
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JoinColumn(name = "output_parser_payload_id")
  @JsonProperty("output_parser_payload")
  @Schema(type = "string")
  private Payload payload;

  @Enumerated(EnumType.STRING)
  @Column(name = "output_parser_mode")
  @JsonProperty("output_parser_mode")
  @NotNull
  private ParserMode mode;

  @Enumerated(EnumType.STRING)
  @Column(name = "output_parser_type")
  @JsonProperty("output_parser_type")
  @NotNull
  private ParserType type;

  @OneToMany(mappedBy = "outputParser", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
  @JsonProperty("output_parser_contract_output_elements")
  private Set<ContractOutputElement> contractOutputElements = new HashSet<>();

  @Column(name = "output_parser_created_at")
  @JsonProperty("output_parser_created_at")
  @NotNull
  private Instant createdAt = now();

  @Column(name = "output_parser_updated_at")
  @JsonProperty("output_parser_updated_at")
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
    this.id = null;
    if (id != null && !id.isEmpty()) {
      this.id = UUID.fromString(id);
    }
  }
}
