package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ExerciseUpdateImageInput {

    @JsonProperty("exercise_image")
    private String imageId;

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }
}
