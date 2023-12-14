package io.openex.rest.group.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Grant;

import jakarta.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class GroupGrantInput {

    @JsonProperty("grant_name")
    private Grant.GRANT_TYPE name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("grant_exercise")
    private String exerciseId;

    public Grant.GRANT_TYPE getName() {
        return name;
    }

    public void setName(Grant.GRANT_TYPE name) {
        this.name = name;
    }

    public String getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(String exerciseId) {
        this.exerciseId = exerciseId;
    }
}
