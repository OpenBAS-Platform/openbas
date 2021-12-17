package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ObjectiveCreateInput {

    @JsonProperty("objective_title")
    private String title;

    @JsonProperty("objective_description")
    private String description;

    @JsonProperty("objective_priority")
    private Integer priority;

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

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
}
