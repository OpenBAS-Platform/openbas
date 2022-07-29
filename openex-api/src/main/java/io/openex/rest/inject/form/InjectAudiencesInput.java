package io.openex.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class InjectAudiencesInput {

    @JsonProperty("inject_audiences")
    private List<String> audienceIds;

    public List<String> getAudienceIds() {
        return audienceIds;
    }

    public void setAudienceIds(List<String> audienceIds) {
        this.audienceIds = audienceIds;
    }
}
