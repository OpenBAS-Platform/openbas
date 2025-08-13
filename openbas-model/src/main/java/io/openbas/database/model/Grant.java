package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Setter
@Getter
@Entity
@Table(name = "grants")
public class Grant implements Base {

  public enum GRANT_TYPE {
    OBSERVER(1),
    LAUNCHER(2),
    PLANNER(3);

    private final int priority;

    GRANT_TYPE(int priority) {
      this.priority = priority;
    }

    public int getPriority() {
      return priority;
    }

    //  verify that priority is unique
    static {
      var priorities = new java.util.HashSet<Integer>();
      for (GRANT_TYPE type : GRANT_TYPE.values()) {
        if (!priorities.add(type.priority)) {
          throw new IllegalStateException("Duplicate priority found in GRANT_TYPE: " + type.name());
        }
      }
    }
  }

  @Id
  @Column(name = "grant_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("grant_id")
  @NotBlank
  private String id;

  @Column(name = "grant_name")
  @JsonProperty("grant_name")
  @Enumerated(EnumType.STRING)
  @NotNull
  private GRANT_TYPE name;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "grant_group")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("grant_group")
  @Schema(type = "string")
  private Group group;

  @JoinColumn(name = "grant_resource")
  @JsonProperty("grant_resource")
  @Schema(type = "string")
  private String resourceId;

  @Column(name = "resource_type")
  @JsonProperty("grant_resource_type")
  @Schema(type = "string")
  private String resourceType;

  @Override
  public boolean isUserHasAccess(User user) {
    return user.isAdmin();
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
