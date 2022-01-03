package io.openex.rest.exercise.export;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.rest.inject.form.InjectInput;

import java.util.ArrayList;
import java.util.List;

public class ExerciseFileImport<T> {

    @JsonProperty("exercise_information")
    private ExerciseImport exercise;

    @JsonProperty("exercise_audiences")
    private List<AudienceImport> audiences = new ArrayList<>();

    @JsonProperty("exercise_tags")
    private List<TagImport> tags = new ArrayList<>();

    @JsonProperty("exercise_injects")
    private List<InjectInput<T>> injects = new ArrayList<>();

    public ExerciseImport getExercise() {
        return exercise;
    }

    public void setExercise(ExerciseImport exercise) {
        this.exercise = exercise;
    }

    public List<AudienceImport> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<AudienceImport> audiences) {
        this.audiences = audiences;
    }

    public List<TagImport> getTags() {
        return tags;
    }

    public void setTags(List<TagImport> tags) {
        this.tags = tags;
    }

    public List<InjectInput<T>> getInjects() {
        return injects;
    }

    public void setInjects(List<InjectInput<T>> injects) {
        this.injects = injects;
    }
}
