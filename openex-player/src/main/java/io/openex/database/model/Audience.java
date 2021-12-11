package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "audiences")
public class Audience implements Base {
    @Id
    @Column(name = "audience_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("audience_id")
    private String id;

    @Column(name = "audience_name")
    @JsonProperty("audience_name")
    private String name;

    @Column(name = "audience_enabled")
    @JsonProperty("audience_enabled")
    private boolean enabled;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audience_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("audience_exercise")
    private Exercise exercise;

    @OneToMany(mappedBy = "audience", fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.SUBSELECT)
    @JsonProperty("audience_subaudiences")
    private List<SubAudience> subAudiences = new ArrayList<>();

    @JsonProperty("audience_users_number")
    public long getUsersNumber() {
        return getSubAudiences().stream()
                .flatMap(subAudience -> subAudience.getUsers().stream())
                .distinct().count();
    }

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

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public List<SubAudience> getSubAudiences() {
        return subAudiences;
    }

    public void setSubAudiences(List<SubAudience> subAudiences) {
        this.subAudiences = subAudiences;
    }
}
