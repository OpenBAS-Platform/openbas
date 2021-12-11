package io.openex.player.model.database;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.player.helper.MonoModelDeserializer;
import io.openex.player.helper.MultiModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "objectives")
public class Objective implements Base {
    @Id
    @Column(name = "objective_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("objective_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objective_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("objective_exercise")
    private Exercise exercise;

    @Column(name = "objective_title")
    @JsonProperty("objective_title")
    private String title;

    @Column(name = "objective_description")
    @JsonProperty("objective_description")
    private String description;

    @Column(name = "objective_priority")
    @JsonProperty("objective_priority")
    private Short priority;

    @OneToMany(mappedBy = "objective")
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("objective_subobjectives")
    private List<SubObjective> subObjectives = new ArrayList<>();

    public String getId() {
        return id;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Short getPriority() {
        return priority;
    }

    public void setPriority(Short priority) {
        this.priority = priority;
    }

    public List<SubObjective> getSubObjectives() {
        return subObjectives;
    }

    public void setSubObjectives(List<SubObjective> subObjectives) {
        this.subObjectives = subObjectives;
    }
}
