package io.openex.rest.exercise.export;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class AudienceImport {

    @JsonProperty("audience_name")
    private String name;

    @JsonProperty("audience_enabled")
    private boolean enabled;

    @JsonProperty("audience_exercise")
    private String exercise;

    @JsonProperty("audience_users")
    private List<String> users = new ArrayList<>();

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

    public String getExercise() {
        return exercise;
    }

    public void setExercise(String exercise) {
        this.exercise = exercise;
    }

    public List<String> getUsers() {
        return users;
    }

    public void setUsers(List<String> users) {
        this.users = users;
    }
}
