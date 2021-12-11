package io.openex.player.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;

public class ExerciseCreateInput {

    @NotBlank(message = "This value should not be blank.")
    @JsonProperty("exercise_name")
    private String name;

    @NotBlank(message = "This value should not be blank.")
    @JsonProperty("exercise_description")
    private String description;

    @NotBlank(message = "This value should not be blank.")
    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @NotNull(message = "This value should not be blank.")
    @JsonProperty("exercise_start_date")
    private Date start;

    @NotNull(message = "This value should not be blank.")
    @JsonProperty("exercise_end_date")
    private Date end;

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

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return end;
    }

    public void setEnd(Date end) {
        this.end = end;
    }
}
