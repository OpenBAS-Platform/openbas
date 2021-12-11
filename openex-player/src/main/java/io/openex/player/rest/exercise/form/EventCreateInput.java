package io.openex.player.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EventCreateInput {

    @JsonProperty("event_title")
    private String title;

    @JsonProperty("event_description")
    private String description;

    @JsonProperty("event_order")
    private Short order;

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

    public Short getOrder() {
        return order;
    }

    public void setOrder(Short order) {
        this.order = order;
    }
}
