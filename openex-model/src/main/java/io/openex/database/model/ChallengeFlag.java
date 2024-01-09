package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "challenges_flags")
@EntityListeners(ModelBaseListener.class)
public class ChallengeFlag implements Base {

    public enum FLAG_TYPE {
        VALUE,
        VALUE_CASE,
        REGEXP,
    }

    @Id
    @Column(name = "flag_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("flag_id")
    private String id;

    @Column(name = "flag_created_at")
    @JsonProperty("flag_created_at")
    private Instant createdAt = now();

    @Column(name = "flag_updated_at")
    @JsonProperty("flag_updated_at")
    private Instant updatedAt = now();

    @Column(name = "flag_type")
    @JsonProperty("flag_type")
    @Enumerated(EnumType.STRING)
    private FLAG_TYPE type;

    @Column(name = "flag_value")
    @JsonProperty("flag_value")
    private String value;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JoinColumn(name = "flag_challenge")
    @JsonProperty("flag_challenge")
    private Challenge challenge;

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return challenge.isUserHasAccess(user);
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

    public FLAG_TYPE getType() {
        return type;
    }

    public void setType(FLAG_TYPE type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Challenge getChallenge() {
        return challenge;
    }

    public void setChallenge(Challenge challenge) {
        this.challenge = challenge;
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
