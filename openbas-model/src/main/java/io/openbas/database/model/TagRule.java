package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Setter
@Getter
@Table(name = "tag_rules")
@EntityListeners(ModelBaseListener.class)
public class TagRule implements Base {

  @Id
  @Column(name = "tag_rule_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("tag_rule_id")
  @NotBlank
  private String id;

  @OneToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "tag_id")
  private Tag tag;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "tag_rule_assets",
      joinColumns = @JoinColumn(name = "tag_rule_id"),
      inverseJoinColumns = @JoinColumn(name = "asset_id"))
  private List<Asset> assets = new ArrayList<>();

  @JsonIgnore
  @Override
  public boolean isUserHasAccess(User user) {
    return true;
  }

  @Override
  public String getId() {
    return id;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || !Base.class.isAssignableFrom(o.getClass())) {
      return false;
    }
    Base base = (Base) o;
    return id.equals(base.getId());
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
