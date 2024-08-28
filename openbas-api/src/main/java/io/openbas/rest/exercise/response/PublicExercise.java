package io.openbas.rest.exercise.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Exercise;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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

}
