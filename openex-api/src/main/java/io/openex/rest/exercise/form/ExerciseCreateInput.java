package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.FutureOrPresent;
import javax.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.NOW_FUTURE_MESSAGE;
import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class ExerciseCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("exercise_name")
    private String name;

    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @JsonProperty("exercise_description")
    private String description;

    @JsonProperty("exercise_start_date")
    @FutureOrPresent(message = NOW_FUTURE_MESSAGE)
    private Instant start;

    @JsonProperty("exercise_tags")
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

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }

    public Instant getStart() {
        return start != null ? start.truncatedTo(ChronoUnit.MINUTES) : null;
    }

    public void setStart(Instant start) {
        this.start = start;
    }
}
