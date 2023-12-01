package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "lessons_answers")
@EntityListeners(ModelBaseListener.class)
public class LessonsAnswer implements Base {
    @Id
    @Column(name = "lessons_answer_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("lessonsanswer_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessons_answer_question")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("lessons_answer_question")
    private LessonsQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessons_answer_user")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("lessons_answer_user")
    private User user;

    @Column(name = "lessons_answer_created_at")
    @JsonProperty("lessons_answer_created_at")
    private Instant created = now();

    @Column(name = "lessons_answer_updated_at")
    @JsonProperty("lessons_answer_updated_at")
    private Instant updated = now();

    @Column(name = "lessons_answer_positive")
    @JsonProperty("lessons_answer_positive")
    private String positive;

    @Column(name = "lessons_answer_negative")
    @JsonProperty("lessons_answer_negative")
    private String negative;

    @Column(name = "lessons_answer_score")
    @JsonProperty("lessons_answer_score")
    private Integer score;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LessonsQuestion getQuestion() {
        return question;
    }

    public void setQuestion(LessonsQuestion question) {
        this.question = question;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getPositive() {
        return positive;
    }

    public void setPositive(String positive) {
        this.positive = positive;
    }

    public String getNegative() {
        return negative;
    }

    public void setNegative(String negative) {
        this.negative = negative;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    // region transient
    @JsonProperty("lessons_answer_exercise")
    public String getExercise() {
        return getQuestion().getCategory().getExercise().getId();
    }
    // endregion

    @Override
    public boolean isUserHasAccess(User user) {
        return getQuestion().getCategory().getExercise().isUserHasAccess(user);
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
