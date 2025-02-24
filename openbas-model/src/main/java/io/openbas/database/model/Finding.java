package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

import static java.time.Instant.now;

@Data
@Entity
@Table(name = "findings")
@EntityListeners(ModelBaseListener.class)
public class Finding implements Base {

  @Id
  @Column(name = "finding_id", updatable = false, nullable = false)
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("finding_id")
  @NotBlank
  private String id;

  @Column(name = "finding_field", nullable = false)
  @JsonProperty("finding_field")
  @NotBlank
  private String field;

  @Column(name = "finding_type", updatable = false, nullable = false)
  @Enumerated(EnumType.STRING)
  @JsonProperty("finding_type")
  @NotNull
  protected ContractOutputType type;

  @Column(name = "finding_value", nullable = false)
  @JsonProperty("finding_value")
  @NotBlank
  protected String value;

  @Type(StringArrayType.class)
  @Column(name = "finding_labels", columnDefinition = "text[]")
  @JsonProperty("finding_labels")
  private String[] labels;

  // -- RELATION --

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "finding_inject_id")
  @JsonProperty("finding_inject_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @Schema(type = "string")
  private Inject inject;

  // -- AUDIT --

  @CreationTimestamp
  @Column(name = "finding_created_at", updatable = false, nullable = false)
  @JsonProperty("finding_created_at")
  @NotNull
  private Instant creationDate = now();

  @UpdateTimestamp
  @Column(name = "finding_updated_at", nullable = false)
  @JsonProperty("finding_updated_at")
  @NotNull
  private Instant updateDate = now();

}
