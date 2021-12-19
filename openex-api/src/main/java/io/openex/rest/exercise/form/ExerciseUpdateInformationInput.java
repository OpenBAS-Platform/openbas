package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public class ExerciseUpdateInformationInput {

    @JsonProperty("exercise_name")
    private String name;

    @JsonProperty("exercise_description")
    private String description;

    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @JsonProperty("exercise_latitude")
    private Double latitude;

    @JsonProperty("exercise_longitude")
    private Double longitude;

    @JsonProperty("exercise_start_date")
    private Date start;

    @JsonProperty("exercise_end_date")
    private Date end;

    @JsonProperty("exercise_animation_group")
    private String animationGroup;

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

    public String getAnimationGroup() {
        return animationGroup;
    }

    public void setAnimationGroup(String animationGroup) {
        this.animationGroup = animationGroup;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
