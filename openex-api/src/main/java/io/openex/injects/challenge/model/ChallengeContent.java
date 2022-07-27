package io.openex.injects.challenge.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.email.model.EmailContent;

import java.util.List;

public class ChallengeContent extends EmailContent {

    @JsonProperty("challenge_ids")
    private List<String> challengeIds;

    public List<String> getChallengeIds() {
        return challengeIds;
    }

    public void setChallengeIds(List<String> challengeIds) {
        this.challengeIds = challengeIds;
    }
}
