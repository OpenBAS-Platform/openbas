package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.Objects;

@Entity
@Table(name = "tags")
@EntityListeners(ModelBaseListener.class)
public class Tag implements Base {

  @Setter
  @Id
  @Column(name = "tag_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("tag_id")
  @NotBlank
  private String id;

  @Getter
  @Column(name = "tag_name")
  @JsonProperty("tag_name")
  @Queryable(searchable = true, sortable = true)
  @NotBlank
  private String name;

  @Getter
  @Column(name = "tag_color")
  @JsonProperty("tag_color")
  @Queryable(sortable = true)
  private String color;

  @JsonIgnore
  @Override
  public boolean isUserHasAccess(User user) {
    return true;
  }

  @Override
  public String getId() {
    return id;
  }

  public void setName(String name) {
    this.name = name.toLowerCase();
  }

  public void setColor(String color) {
    this.color = color.toLowerCase();
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
