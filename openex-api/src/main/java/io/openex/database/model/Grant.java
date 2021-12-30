package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(name = "grants")
public class Grant implements Base {

    public enum GRANT_TYPE {
        OBSERVER,
        PLANNER
    }

    @Id
    @Column(name = "grant_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("grant_id")
    private String id;

    @Column(name = "grant_name")
    @JsonProperty("grant_name")
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grant_group")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("grant_group")
    private Group group;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grant_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("grant_exercise")
    private Exercise exercise;

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

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }
}
