package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdDeserializer;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "lessons_template_categories")
@EntityListeners(ModelBaseListener.class)
public class LessonsTemplateCategory implements Base {
    @Id
    @Column(name = "lessons_template_category_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("lessonstemplatecategory_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessons_template_category_template")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("lessons_template_category_template")
    private LessonsTemplate template;

    @Column(name = "lessons_template_category_created_at")
    @JsonProperty("lessons_template_category_created_at")
    private Instant created = now();

    @Column(name = "lessons_template_category_updated_at")
    @JsonProperty("lessons_template_category_updated_at")
    private Instant updated = now();

    @Column(name = "lessons_template_category_name")
    @JsonProperty("lessons_template_category_name")
    private String name;

    @Column(name = "lessons_template_category_description")
    @JsonProperty("lessons_template_category_description")
    private String description;

    @Column(name = "lessons_template_category_order")
    @JsonProperty("lessons_template_category_order")
    private int order;

    @OneToMany(mappedBy = "category", fetch = FetchType.EAGER)
    @JsonProperty("lessons_template_category_questions")
    @JsonSerialize(using = MultiIdDeserializer.class)
    private List<LessonsTemplateQuestion> questions = new ArrayList<>();

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return template.isUserHasAccess(user);
    }

    public void setId(String id) {
        this.id = id;
    }

    public LessonsTemplate getTemplate() {
        return template;
    }

    public void setTemplate(LessonsTemplate template) {
        this.template = template;
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

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public List<LessonsTemplateQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<LessonsTemplateQuestion> questions) {
        this.questions = questions;
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
