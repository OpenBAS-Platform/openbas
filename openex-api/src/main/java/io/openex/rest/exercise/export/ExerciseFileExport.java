package io.openex.rest.exercise.export;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Audience;
import io.openex.database.model.Exercise;
import io.openex.database.model.Inject;
import io.openex.database.model.Tag;

import java.util.ArrayList;
import java.util.List;

public class ExerciseFileExport {

    @JsonProperty("exercise_information")
    private Exercise exercise;

    @JsonProperty("exercise_audiences")
    private List<Audience> audiences = new ArrayList<>();

    @JsonProperty("exercise_injects")
    private List<Inject<?>> injects = new ArrayList<>();

    @JsonProperty("exercise_tags")
    private List<Tag> tags = new ArrayList<>();

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public List<Audience> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<Audience> audiences) {
        this.audiences = audiences;
    }

    public List<Inject<?>> getInjects() {
        return injects;
    }

    public void setInjects(List<Inject<?>> injects) {
        this.injects = injects;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
}
