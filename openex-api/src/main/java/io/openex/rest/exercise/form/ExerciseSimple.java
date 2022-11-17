package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.model.Exercise;
import io.openex.database.model.Tag;
import io.openex.helper.MultiIdDeserializer;
import org.springframework.beans.BeanUtils;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ExerciseSimple {

    @JsonProperty("exercise_id")
    private String id;

    @JsonProperty("exercise_name")
    private String name;

    @JsonProperty("exercise_status")
    @Enumerated(EnumType.STRING)
    private Exercise.STATUS status;

    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @JsonProperty("exercise_start_date")
    private Instant start;

    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_tags")
    private List<Tag> tags = new ArrayList<>();

    public static ExerciseSimple fromExercise(Exercise exercise) {
        ExerciseSimple simple = new ExerciseSimple();
        BeanUtils.copyProperties(exercise, simple);
        simple.setStart(exercise.getStart().orElse(null));
        return simple;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Exercise.STATUS getStatus() {
        return status;
    }

    public void setStatus(Exercise.STATUS status) {
        this.status = status;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public Instant getStart() {
        return start;
    }

    public void setStart(Instant start) {
        this.start = start;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
}
