package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.audit.ModelBaseListener;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "challenges")
@EntityListeners(ModelBaseListener.class)
public class Challenge implements Base {
    @Id
    @Column(name = "challenge_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("challenge_id")
    private String id;

    @Column(name = "challenge_created_at")
    @JsonProperty("challenge_created_at")
    private Instant createdAt = now();

    @Column(name = "challenge_updated_at")
    @JsonProperty("challenge_updated_at")
    private Instant updatedAt = now();

    @Column(name = "challenge_name")
    @JsonProperty("challenge_name")
    private String name;

    @Column(name = "challenge_description")
    @JsonProperty("challenge_description")
    private String description;

    @Column(name = "challenge_flag")
    @JsonProperty("challenge_flag")
    private String flag;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name.toLowerCase();
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFlag() {
        return flag;
    }

    public void setFlag(String flag) {
        this.flag = flag;
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
