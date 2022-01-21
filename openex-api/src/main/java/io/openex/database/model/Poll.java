package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "polls")
@EntityListeners(ModelBaseListener.class)
public class Poll implements Base {
    @Id
    @Column(name = "poll_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("objective_id")
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "poll_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("poll_exercise")
    private Exercise exercise;

    @Column(name = "poll_question")
    @JsonProperty("poll_question")
    private String question;

    @Column(name = "poll_created_at")
    @JsonProperty("poll_created_at")
    private Instant created = now();

    @Column(name = "poll_updated_at")
    @JsonProperty("poll_updated_at")
    private Instant updated = now();

    @OneToMany(mappedBy = "poll", fetch = FetchType.EAGER)
    @Fetch(FetchMode.SUBSELECT)
    @JsonSerialize(using = MultiModelDeserializer.class)
    private List<Answer> answers = new ArrayList<>();

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

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
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

    public List<Answer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<Answer> answers) {
        this.answers = answers;
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
