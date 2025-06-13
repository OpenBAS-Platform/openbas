package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
}
