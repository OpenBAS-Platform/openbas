package io.openex.rest.lessons.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class LessonsCategoryAudiencesInput {

    @JsonProperty("lessons_category_audiences")
    private List<String> audienceIds;

    public List<String> getAudienceIds() {
        return audienceIds;
    }

    public void setAudienceIds(List<String> audienceIds) {
        this.audienceIds = audienceIds;
    }
}
