package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "collectors")
@EntityListeners(ModelBaseListener.class)
public class Collector implements Base {

  @Id
  @Column(name = "collector_id")
  @JsonProperty("collector_id")
  @NotBlank
  private String id;

  @Column(name = "collector_name")
  @JsonProperty("collector_name")
  @NotBlank
  private String name;

  @Column(name = "collector_type")
  @JsonProperty("collector_type")
  @NotBlank
  private String type;

  @Column(name = "collector_period")
  @JsonProperty("collector_period")
  private int period;

  @Column(name = "collector_external")
  @JsonProperty("collector_external")
  private boolean external = false;

  @Column(name = "collector_created_at")
  @JsonProperty("collector_created_at")
  @NotNull
  private Instant createdAt = now();

  @Column(name = "collector_updated_at")
  @JsonProperty("collector_updated_at")
  @NotNull
  private Instant updatedAt = now();

  @Column(name = "collector_last_execution")
  @JsonProperty("collector_last_execution")
  private Instant lastExecution;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "collector_security_platform")
  @JsonProperty("collector_security_platform")
  private SecurityPlatform securityPlatform;

  @JsonIgnore
  @Override
  public boolean isUserHasAccess(User user) {
    return user.isAdmin();
  }

  @Override
  public String toString() {
    return name;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || !Base.class.isAssignableFrom(o.getClass())) return false;
    Base base = (Base) o;
    return id.equals(base.getId());
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
