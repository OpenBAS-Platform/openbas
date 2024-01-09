package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MultiIdDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
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
    @UuidGenerator
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

    // CascadeType.ALL is required here because Flags are embedded
    @OneToMany(mappedBy = "challenge", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonProperty("challenge_flags")
    @JsonSerialize(using = MultiModelDeserializer.class)
    private List<ChallengeFlag> flags = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "challenges_tags",
            joinColumns = @JoinColumn(name = "challenge_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("challenge_tags")
    private List<Tag> tags = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "challenges_documents",
            joinColumns = @JoinColumn(name = "challenge_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("challenge_documents")
    private List<Document> documents = new ArrayList<>();

    @Transient
    private List<String> exerciseIds = new ArrayList<>();

    @Transient
    private Instant virtualPublication;

    @JsonProperty("challenge_virtual_publication")
    public Instant getVirtualPublication() {
        return virtualPublication;
    }

    public void setVirtualPublication(Instant virtualPublication) {
        this.virtualPublication = virtualPublication;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin();
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }

    @JsonProperty("challenge_exercises")
    public List<String> getExerciseIds() {
        return exerciseIds;
    }

    public void setExerciseIds(List<String> exerciseIds) {
        this.exerciseIds = exerciseIds;
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
