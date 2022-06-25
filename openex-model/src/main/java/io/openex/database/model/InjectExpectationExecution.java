package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "injects_expectations_executions")
public class InjectExpectationExecution {

    @Id
    @Column(name = "expectation_execution_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("expectation_execution_id")
    private String id;

    @Column(name = "expectation_execution_created_at")
    @JsonProperty("expectation_execution_created_at")
    private Instant createdAt = now();

    @Column(name = "expectation_execution_updated_at")
    @JsonProperty("expectation_execution_updated_at")
    private Instant updatedAt = now();

    @Column(name = "expectation_execution_result")
    @JsonProperty("expectation_execution_result")
    private String result;

    @ManyToOne
    @JoinColumn(name = "inject_expectation_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("expectation_execution_expectation")
    private InjectExpectation expectation;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("expectation_execution_exercise")
    private Exercise exercise;

    @ManyToOne
    @JoinColumn(name = "inject_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("expectation_execution_inject")
    private Inject inject;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("expectation_execution_user")
    private User user;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public InjectExpectation getExpectation() {
        return expectation;
    }

    public void setExpectation(InjectExpectation expectation) {
        this.expectation = expectation;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public Inject getInject() {
        return inject;
    }

    public void setInject(Inject inject) {
        this.inject = inject;
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
