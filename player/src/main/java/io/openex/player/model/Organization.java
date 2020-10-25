package io.openex.player.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Organization {

    private String name;

    @JsonProperty("organization_name")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
