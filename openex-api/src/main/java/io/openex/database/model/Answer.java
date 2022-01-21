package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "answers")
@EntityListeners(ModelBaseListener.class)
public class Answer implements Base {
    @Id
    @Column(name = "answer_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("objective_id")
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "answer_poll")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("answer_poll")
    private Poll poll;

    @Column(name = "answer_content")
    @JsonProperty("answer_content")
    private String content;

    @Column(name = "answer_evaluation")
    @JsonProperty("answer_evaluation")
    private Long evaluation;

    @Column(name = "answer_created_at")
    @JsonProperty("answer_created_at")
    private Instant created = now();

    @Column(name = "answer_updated_at")
    @JsonProperty("answer_updated_at")
    private Instant updated = now();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Poll getPoll() {
        return poll;
    }

    public void setPoll(Poll poll) {
        this.poll = poll;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(Long evaluation) {
        this.evaluation = evaluation;
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
