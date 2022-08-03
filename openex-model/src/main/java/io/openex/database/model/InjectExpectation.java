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
@Table(name = "injects_expectations")
@EntityListeners(ModelBaseListener.class)
public class InjectExpectation implements Base {
    public enum EXPECTATION_TYPE {
        TEXT,
        DOCUMENT,
        ARTICLE,
        CHALLENGE,
        MANUAL,
    }

    @Column(name = "inject_expectation_type")
    @JsonProperty("inject_expectation_type")
    @Enumerated(EnumType.STRING)
    private EXPECTATION_TYPE type;

    // region basic
    @Id
    @Column(name = "inject_expectation_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("inject_expectation_id")
    private String id;

    @Column(name = "inject_expectation_created_at")
    @JsonProperty("inject_expectation_created_at")
    private Instant createdAt = now();

    @Column(name = "inject_expectation_updated_at")
    @JsonProperty("inject_expectation_updated_at")
    private Instant updatedAt = now();

    @Column(name = "inject_expectation_result")
    @JsonProperty("inject_expectation_result")
    private String result;

    @Column(name = "inject_expectation_score")
    @JsonProperty("inject_expectation_score")
    private Integer score;

    @Column(name = "inject_expectation_expected_score")
    @JsonProperty("inject_expectation_expected_score")
    private Integer expectedScore;
    // endregion

    // region contextual relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("inject_expectation_exercise")
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inject_id")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("inject_expectation_inject")
    private Inject inject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("inject_expectation_user")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audience_id")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("inject_expectation_audience")
    private Audience audience;
    // endregion

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("inject_expectation_article")
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("inject_expectation_challenge")
    private Challenge challenge;

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

    public Audience getAudience() {
        return audience;
    }

    public void setAudience(Audience audience) {
        this.audience = audience;
    }

    public EXPECTATION_TYPE getType() {
        return type;
    }

    public void setType(EXPECTATION_TYPE type) {
        this.type = type;
    }

    public Integer getScore() {
        return score;
    }

    public Integer getExpectedScore() {
        return expectedScore;
    }

    public void setExpectedScore(Integer expectedScore) {
        this.expectedScore = expectedScore;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.type = EXPECTATION_TYPE.ARTICLE;
        this.article = article;
    }

    public Challenge getChallenge() {
        return challenge;
    }

    public void setChallenge(Challenge challenge) {
        this.type = EXPECTATION_TYPE.CHALLENGE;
        this.challenge = challenge;
    }

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
