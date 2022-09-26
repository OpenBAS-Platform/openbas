package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import io.openex.helper.MultiIdDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;
import static java.util.Optional.ofNullable;

@Entity
@Table(name = "lessons_questions")
@EntityListeners(ModelBaseListener.class)
public class LessonsQuestion implements Base {
    @Id
    @Column(name = "lessons_question_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("lessonsquestion_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessons_question_category")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("lessons_question_category")
    private LessonsCategory category;

    @Column(name = "lessons_question_created_at")
    @JsonProperty("lessons_question_created_at")
    private Instant created = now();

    @Column(name = "lessons_question_updated_at")
    @JsonProperty("lessons_question_updated_at")
    private Instant updated = now();

    @Column(name = "lessons_question_content")
    @JsonProperty("lessons_question_content")
    private String content;

    @Column(name = "lessons_question_explanation")
    @JsonProperty("lessons_question_explanation")
    private String explanation;

    @Column(name = "lessons_question_order")
    @JsonProperty("lessons_question_order")
    private int order;

    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY)
    @JsonProperty("lessons_question_answers")
    @JsonSerialize(using = MultiIdDeserializer.class)
    private List<LessonsAnswer> answers = new ArrayList<>();

    // region transient
    @JsonProperty("lessons_question_exercise")
    public String getExercise() {
        return getCategory().getExercise().getId();
    }
    // endregion

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LessonsCategory getCategory() {
        return category;
    }

    public void setCategory(LessonsCategory category) {
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

    public List<LessonsAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<LessonsAnswer> answers) {
        this.answers = answers;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return getCategory().getExercise().isUserHasAccess(user);
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
