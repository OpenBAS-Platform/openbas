package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class ExerciseUpdateTagsInput {

    @JsonProperty("exercise_tags")
    private List<String> tagIds = new ArrayList<>();

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }
}
