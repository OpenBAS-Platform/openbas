package io.openex.rest.challenge.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.ChallengeFlag;

public class PublicChallengeFlag {

    @JsonProperty("flag_id")
    private String id;

    @JsonProperty("flag_type")
    private ChallengeFlag.FLAG_TYPE type;

    @JsonProperty("flag_challenge")
    private String challenge;

    public PublicChallengeFlag(ChallengeFlag challengeFlag) {
        this.id = challengeFlag.getId();
        this.type = challengeFlag.getType();
        this.challenge = challengeFlag.getChallenge().getId();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ChallengeFlag.FLAG_TYPE getType() {
        return type;
    }

    public void setType(ChallengeFlag.FLAG_TYPE type) {
        this.type = type;
    }

    public String getChallenge() {
        return challenge;
    }

    public void setChallenge(String challenge) {
        this.challenge = challenge;
    }
}
