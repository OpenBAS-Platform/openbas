package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "lessons_templates")
@EntityListeners(ModelBaseListener.class)
public class LessonsTemplate implements Base {
    @Id
    @Column(name = "lessons_template_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("lessonstemplate_id")
    private String id;

    @Column(name = "lessons_template_created_at")
    @JsonProperty("lessons_template_created_at")
    private Instant created = now();

    @Column(name = "lessons_template_updated_at")
    @JsonProperty("lessons_template_updated_at")
    private Instant updated = now();

    @Column(name = "lessons_template_name")
    @JsonProperty("lessons_template_name")
    private String name;

    @Column(name = "lessons_template_description")
    @JsonProperty("lessons_template_description")
    private String description;

    @OneToMany(mappedBy = "template", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<LessonsTemplateCategory> categories = new ArrayList<>();

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin();
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getCreated() {
        return created;
    }

    public void setCreated(Instant created) {
        this.created = created;
    }

    public Instant getUpdated() {
        return updated;
    }

    public void setUpdated(Instant updated) {
        this.updated = updated;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<LessonsTemplateCategory> getCategories() {
        return categories;
    }

    public void setCategories(List<LessonsTemplateCategory> categories) {
        this.categories = categories;
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
