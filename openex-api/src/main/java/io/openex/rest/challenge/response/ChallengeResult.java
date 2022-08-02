package io.openex.rest.challenge.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChallengeResult {
    @JsonProperty("result")
    private Boolean result;

    public ChallengeResult(Boolean result) {
        this.result = result;
    }

    public Boolean getResult() {
        return result;
    }

    public void setResult(Boolean result) {
        this.result = result;
    }
}
