package io.openbas.rest.exercise.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Exercise;

public class PublicExercise {

    @JsonProperty("exercise_id")
    private String id;

    @JsonProperty("exercise_name")
    private String name;

    @JsonProperty("exercise_description")
    private String description;

    public PublicExercise(Exercise exercise) {
        this.id = exercise.getId();
        this.name = exercise.getName();
        this.description = exercise.getDescription();
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
