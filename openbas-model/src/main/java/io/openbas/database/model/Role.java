package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "roles")
@EntityListeners(ModelBaseListener.class)
@EqualsAndHashCode
public class Role implements Base {

  @Id
  @UuidGenerator
  @Column(name = "role_id")
  @JsonProperty("role_id")
  @NotBlank
  private String id;

  @JsonProperty("role_name")
  @Column(name = "role_name")
  @NotBlank
  private String name;

  @ElementCollection(targetClass = Capability.class)
  @JoinTable(name = "roles_capabilities", joinColumns = @JoinColumn(name = "role_id"))
  @Enumerated(EnumType.STRING)
  @Column(name = "capability")
  private Set<Capability> capabilities = new HashSet<>();

  @Column(name = "role_created_at")
  @JsonProperty("role_created_at")
  @NotNull
  @Schema(description = "Creation date of the role", accessMode = Schema.AccessMode.READ_ONLY)
  private Instant createdAt = now();

  @Column(name = "role_updated_at")
  @JsonProperty("role_updated_at")
  @NotNull
  @Schema(description = "Update date of the role", accessMode = Schema.AccessMode.READ_ONLY)
  private Instant updatedAt = now();
}
