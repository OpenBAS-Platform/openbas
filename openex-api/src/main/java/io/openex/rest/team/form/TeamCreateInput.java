package io.openex.rest.team.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class TeamCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("team_name")
    private String name;

    @JsonProperty("team_description")
    private String description;

    @JsonProperty("team_organization")
    private String organizationId;

    @JsonProperty("team_tags")
    private List<String> tagIds = new ArrayList<>();

    @JsonProperty("team_exercises")
    private List<String> exerciseIds = new ArrayList<>();

    @JsonProperty("team_contextual")
    private Boolean contextual = false;

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

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }

    public List<String> getExerciseIds() {
        return exerciseIds;
    }

    public void setExerciseIds(List<String> exerciseIds) {
        this.exerciseIds = exerciseIds;
    }

    public Boolean getContextual() {
        return contextual;
    }

    public void setContextual(Boolean contextual) {
        this.contextual = contextual;
    }
}
