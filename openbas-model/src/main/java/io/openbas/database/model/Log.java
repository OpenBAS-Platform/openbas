package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdDeserializer;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "logs")
@EntityListeners(ModelBaseListener.class)
public class Log implements Base {
    @Id
    @Column(name = "log_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("log_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_exercise")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("log_exercise")
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_user")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("log_user")
    private User user;

    @Column(name = "log_title")
    @JsonProperty("log_title")
    private String title;

    @Column(name = "log_content")
    @JsonProperty("log_content")
    private String content;

    @Column(name = "log_created_at")
    @JsonProperty("log_created_at")
    private Instant created = now();

    @Column(name = "log_updated_at")
    @JsonProperty("log_updated_at")
    private Instant updated = now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "logs_tags",
            joinColumns = @JoinColumn(name = "log_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("log_tags")
    private List<Tag> tags = new ArrayList<>();

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return exercise.isUserHasAccess(user);
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
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
