package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
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
    PLANNER(2),
    LAUNCHER(3);

    private final int priority;

    GRANT_TYPE(int priority) {
      this.priority = priority;
    }

    public int getPriority() {
      return priority;
    }

    // Get this grant type and all higher priority ones
    public List<GRANT_TYPE> andHigher() {
      return Arrays.stream(values())
          .filter(gt -> gt.getPriority() >= this.getPriority())
          .collect(Collectors.toList());
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

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "grant_exercise")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("grant_exercise")
  @Schema(type = "string")
  private Exercise exercise;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "grant_scenario")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("grant_scenario")
  @Schema(type = "string")
  private Scenario scenario;

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

  @JsonIgnore
  public String getResourceId() {
    return this.getScenario() != null
        ? this.getScenario().getId()
        : this.getExercise() != null ? this.getExercise().getId() : null;
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
