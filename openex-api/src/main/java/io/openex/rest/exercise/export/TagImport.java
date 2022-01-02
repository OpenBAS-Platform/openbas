package io.openex.rest.exercise.export;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TagImport {

    @JsonProperty("tag_name")
    private String name;

    @JsonProperty("tag_color")
    private String color;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
