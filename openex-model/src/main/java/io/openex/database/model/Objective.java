package io.openex.database.model;

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
@Table(name = "objectives")
@EntityListeners(ModelBaseListener.class)
public class Objective implements Base {
    @Id
    @Column(name = "objective_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("objective_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objective_exercise")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("objective_exercise")
    private Exercise exercise;

    @Column(name = "objective_title")
    @JsonProperty("objective_title")
    private String title;

    @Column(name = "objective_description")
    @JsonProperty("objective_description")
    private String description;

    @Column(name = "objective_priority")
    @JsonProperty("objective_priority")
    private Short priority;

    @Column(name = "objective_created_at")
    @JsonProperty("objective_created_at")
    private Instant createdAt = now();

    @Column(name = "objective_updated_at")
    @JsonProperty("objective_updated_at")
    private Instant updatedAt = now();

    @OneToMany(mappedBy = "objective", fetch = FetchType.LAZY)
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("objective_evaluations")
    private List<Evaluation> evaluations = new ArrayList<>();

    // region transient
    @JsonProperty("objective_score")
    public Double getEvaluationAverage() {
        return getEvaluations().stream().mapToDouble(Evaluation::getScore).average().orElse(0D);
    }
    // endregion

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Short getPriority() {
        return priority;
    }

    public void setPriority(Short priority) {
        this.priority = priority;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<Evaluation> getEvaluations() {
        return evaluations;
    }

    public void setEvaluations(List<Evaluation> evaluations) {
        this.evaluations = evaluations;
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
