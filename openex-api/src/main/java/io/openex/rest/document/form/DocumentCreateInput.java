package io.openex.rest.document.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class DocumentCreateInput {

    @JsonProperty("document_description")
    private String description;

    @JsonProperty("document_tags")
    private List<String> tagIds = new ArrayList<>();

    @JsonProperty("document_exercises")
    private List<String> exerciseIds = new ArrayList<>();

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

    public List<String> getExerciseIds() {
        return exerciseIds;
    }

    public void setExerciseIds(List<String> exerciseIds) {
        this.exerciseIds = exerciseIds;
    }
}
