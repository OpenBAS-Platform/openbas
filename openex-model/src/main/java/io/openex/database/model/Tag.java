package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MultiIdDeserializer;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
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
  private String id;

  @Getter
  @Column(name = "tag_name")
  @JsonProperty("tag_name")
  private String name;

  @Getter
  @Column(name = "tag_color")
  @JsonProperty("tag_color")
  private String color;

  @Setter
  @Getter
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "documents_tags",
      joinColumns = @JoinColumn(name = "tag_id"),
      inverseJoinColumns = @JoinColumn(name = "document_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("tags_documents")
  private List<Document> documents = new ArrayList<>();

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
