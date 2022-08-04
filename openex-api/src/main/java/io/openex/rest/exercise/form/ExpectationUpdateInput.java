
package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ExpectationUpdateInput {

    @JsonProperty("expectation_score")
    private Integer score;

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }
}
