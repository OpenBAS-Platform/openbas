package io.openex.rest.lessons.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

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
