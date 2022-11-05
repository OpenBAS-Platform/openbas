package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "lessons_template_questions")
@EntityListeners(ModelBaseListener.class)
public class LessonsTemplateQuestion implements Base {
    @Id
    @Column(name = "lessons_template_question_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("lessonstemplatequestion_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessons_template_question_category")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("lessons_template_question_category")
    private LessonsTemplateCategory category;

    @Column(name = "lessons_template_question_created_at")
    @JsonProperty("lessons_template_question_created_at")
    private Instant created = now();

    @Column(name = "lessons_template_question_updated_at")
    @JsonProperty("lessons_template_question_updated_at")
    private Instant updated = now();

    @Column(name = "lessons_template_question_content")
    @JsonProperty("lessons_template_question_content")
    private String content;

    @Column(name = "lessons_template_question_explanation")
    @JsonProperty("lessons_template_question_explanation")
    private String explanation;

    @Column(name = "lessons_template_question_order")
    @JsonProperty("lessons_template_question_order")
    private int order;

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

    public LessonsTemplateCategory getCategory() {
        return category;
    }

    public void setCategory(LessonsTemplateCategory category) {
        this.category = category;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
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
