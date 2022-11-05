package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MultiIdDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "documents")
@EntityListeners(ModelBaseListener.class)
public class Document implements Base {
    @Id
    @Column(name = "document_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("document_id")
    private String id;

    @Column(name = "document_name")
    @JsonProperty("document_name")
    private String name;

    @Column(name = "document_target")
    @JsonProperty("document_target")
    private String target;

    @Column(name = "document_description")
    @JsonProperty("document_description")
    private String description;

    @Column(name = "document_type")
    @JsonProperty("document_type")
    private String type;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "documents_tags",
            joinColumns = @JoinColumn(name = "document_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("document_tags")
    private List<Tag> tags = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "exercises_documents",
            joinColumns = @JoinColumn(name = "document_id"),
            inverseJoinColumns = @JoinColumn(name = "exercise_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("document_exercises")
    private List<Exercise> exercises = new ArrayList<>();

    @OneToMany(mappedBy = "document", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<InjectDocument> injectDocuments = new ArrayList<>();

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
        this.name = name;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }

    public List<Exercise> getExercises() {
        return exercises;
    }

    public void setExercises(List<Exercise> exercises) {
        this.exercises = exercises;
    }

    public List<InjectDocument> getInjectDocuments() {
        return injectDocuments;
    }

    public void setInjectDocuments(List<InjectDocument> injectDocuments) {
        this.injectDocuments = injectDocuments;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return exercises.stream().anyMatch(exercise -> exercise.isUserHasAccess(user));
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
