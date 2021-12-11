package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class IncidentCreateInput {

    @JsonProperty("incident_title")
    private String title;

    @JsonProperty("incident_story")
    private String story;

    @JsonProperty("incident_type")
    private String type;

    @JsonProperty("incident_order")
    private Short order;

    @JsonProperty("incident_weight")
    private Integer weight;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStory() {
        return story;
    }

    public void setStory(String story) {
        this.story = story;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Short getOrder() {
        return order;
    }

    public void setOrder(Short order) {
        this.order = order;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }
}
