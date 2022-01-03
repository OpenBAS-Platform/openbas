package io.openex.rest.audience.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class AudienceCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("audience_name")
    private String name;

    @JsonProperty("audience_description")
    private String description;

    @JsonProperty("audience_tags")
    private List<String> tagIds = new ArrayList<>();

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

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }
}
