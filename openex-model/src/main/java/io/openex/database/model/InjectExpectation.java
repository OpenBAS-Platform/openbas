package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "injects_expectations")
public class InjectExpectation implements Base {

    public enum EXPECTATION_TYPE {
        DOCUMENT,
        ARTICLE,
        CHALLENGE,
    }

    @Id
    @Column(name = "inject_expectation_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("inject_expectation_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "inject_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("inject_expectation_inject")
    private Inject inject;

    @Column(name = "inject_expectation_type")
    @JsonProperty("inject_expectation_type")
    @Enumerated(EnumType.STRING)
    private EXPECTATION_TYPE type;

    @Column(name = "inject_expectation_document")
    @JsonProperty("inject_expectation_document")
    private String documentName;

    @ManyToOne
    @JoinColumn(name = "article_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("inject_expectation_article")
    private MediaArticle article;

    @ManyToOne
    @JoinColumn(name = "challenge_id")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("inject_expectation_challenge")
    private Challenge challenge;

    @OneToMany(mappedBy = "expectation", fetch = FetchType.EAGER)
    @JsonProperty("inject_expectations_executions")
    @Fetch(FetchMode.SUBSELECT)
    private List<InjectExpectationExecution> executions = new ArrayList<>();

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Inject getInject() {
        return inject;
    }

    public void setInject(Inject inject) {
        this.inject = inject;
    }

    public EXPECTATION_TYPE getType() {
        return type;
    }

    public void setType(EXPECTATION_TYPE type) {
        this.type = type;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public MediaArticle getArticle() {
        return article;
    }

    public void setArticle(MediaArticle article) {
        this.article = article;
    }

    public Challenge getChallenge() {
        return challenge;
    }

    public void setChallenge(Challenge challenge) {
        this.challenge = challenge;
    }

    public List<InjectExpectationExecution> getExecutions() {
        return executions;
    }

    public void setExecutions(List<InjectExpectationExecution> executions) {
        this.executions = executions;
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
