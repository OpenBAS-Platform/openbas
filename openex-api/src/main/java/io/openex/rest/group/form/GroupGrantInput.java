package io.openex.rest.group.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class GroupGrantInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("grant_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("grant_exercise")
    private String exerciseId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(String exerciseId) {
        this.exerciseId = exerciseId;
    }
}
