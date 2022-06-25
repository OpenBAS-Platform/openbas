package io.openex.rest.challenge.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.EMPTY_MESSAGE;
import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class ChallengeCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("challenge_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("challenge_description")
    private String description;

    @NotEmpty(message = EMPTY_MESSAGE)
    @JsonProperty("challenge_flags")
    private List<FlagInput> flags = new ArrayList<>();

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

    public List<FlagInput> getFlags() {
        return flags;
    }

    public void setFlags(List<FlagInput> flags) {
        this.flags = flags;
    }
}
