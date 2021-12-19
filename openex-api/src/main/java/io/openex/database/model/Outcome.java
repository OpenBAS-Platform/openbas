package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(name = "outcomes")
public class Outcome implements Base {
    @Id
    @Column(name = "outcome_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("outcome_id")
    private String id;

    @OneToOne
    @JoinColumn(name = "outcome_inject")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("outcome_incident")
    private Inject<?> inject;

    @Column(name = "outcome_comment")
    @JsonProperty("outcome_comment")
    private String comment;

    @Column(name = "outcome_result")
    @JsonProperty("outcome_result")
    private Integer result;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Inject<?> getInject() {
        return inject;
    }

    public void setInject(Inject<?> inject) {
        this.inject = inject;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Integer getResult() {
        return result;
    }

    public void setResult(Integer result) {
        this.result = result;
    }
}
