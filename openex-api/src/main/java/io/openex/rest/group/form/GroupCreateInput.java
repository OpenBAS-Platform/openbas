package io.openex.rest.group.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Grant;
import lombok.Getter;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Getter
public class GroupCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("group_name")
    private String name;

    @JsonProperty("group_description")
    private String description;

    @JsonProperty("group_default_user_assign")
    private boolean defaultUserAssignation;

    @JsonProperty("group_default_exercise_observer")
    private boolean defaultExerciseObserver;

    @JsonProperty("group_default_exercise_planner")
    private boolean defaultExercisePlanner;

    public List<Grant.GRANT_TYPE> defaultExerciseGrants() {
        List<Grant.GRANT_TYPE> grants = new ArrayList<>();
        if (defaultExercisePlanner) {
            grants.add(Grant.GRANT_TYPE.PLANNER);
        }
        if (defaultExerciseObserver) {
            grants.add(Grant.GRANT_TYPE.OBSERVER);
        }
        return grants;
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

    public boolean isDefaultUserAssignation() {
        return defaultUserAssignation;
    }

    public void setDefaultUserAssignation(boolean defaultUserAssignation) {
        this.defaultUserAssignation = defaultUserAssignation;
    }

    public boolean isDefaultExerciseObserver() {
        return defaultExerciseObserver;
    }

    public void setDefaultExerciseObserver(boolean defaultExerciseObserver) {
        this.defaultExerciseObserver = defaultExerciseObserver;
    }

    public boolean isDefaultExercisePlanner() {
        return defaultExercisePlanner;
    }

    public void setDefaultExercisePlanner(boolean defaultExercisePlanner) {
        this.defaultExercisePlanner = defaultExercisePlanner;
    }
}