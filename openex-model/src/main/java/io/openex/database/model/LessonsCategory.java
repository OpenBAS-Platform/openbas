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

@Entity
@Table(name = "lessons_categories")
@EntityListeners(ModelBaseListener.class)
public class LessonsCategory implements Base {
    @Id
    @Column(name = "lessons_category_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("lessons_category_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessons_category_exercise")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("lessons_category_exercise")
    private Exercise exercise;

    @Column(name = "lessons_category_created_at")
    @JsonProperty("lessons_category_created_at")
    private Instant created = now();

    @Column(name = "lessons_category_updated_at")
    @JsonProperty("lessons_category_updated_at")
    private Instant updated = now();

    @Column(name = "lessons_category_name")
    @JsonProperty("lessons_category_name")
    private String name;

    @Column(name = "lessons_category_description")
    @JsonProperty("lessons_category_description")
    private String description;

    @Column(name = "lessons_category_order")
    @JsonProperty("lessons_category_order")
    private int order;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @JsonProperty("lessons_category_questions")
    @JsonSerialize(using = MultiIdDeserializer.class)
    private List<LessonsQuestion> questions = new ArrayList<>();

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
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

    public List<LessonsQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<LessonsQuestion> questions) {
        this.questions = questions;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return getExercise().isUserHasAccess(user);
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
