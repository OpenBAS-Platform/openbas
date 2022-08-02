package io.openex.injects.challenge.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.email.model.EmailContent;

import java.util.List;

public class ChallengeContent extends EmailContent {

    @JsonProperty("challenges")
    private List<String> challenges;

    public List<String> getChallenges() {
        return challenges;
    }

    public void setChallenges(List<String> challenges) {
        this.challenges = challenges;
    }
}
