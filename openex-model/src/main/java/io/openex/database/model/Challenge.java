package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
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

    @Column(name = "challenge_category")
    @JsonProperty("challenge_category")
    private String category;

    @Column(name = "challenge_content")
    @JsonProperty("challenge_content")
    private String content;

    @Column(name = "challenge_score")
    @JsonProperty("challenge_score")
    private Integer score;

    @Column(name = "challenge_max_attempts")
    @JsonProperty("challenge_max_attempts")
    private Integer maxAttempts;

    @OneToMany(mappedBy = "challenge", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonProperty("challenge_flags")
    @Fetch(FetchMode.SUBSELECT)
    private List<ChallengeFlag> flags = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "challenges_tags",
            joinColumns = @JoinColumn(name = "challenge_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("challenge_tags")
    @Fetch(FetchMode.SUBSELECT)
    private List<Tag> tags = new ArrayList<>();

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

    public List<ChallengeFlag> getFlags() {
        return flags;
    }

    public void setFlags(List<ChallengeFlag> flags) {
        this.flags = flags;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(Integer maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
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
