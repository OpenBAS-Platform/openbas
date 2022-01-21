package io.openex.rest.objective.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EvaluationCreateInput {

    @JsonProperty("evaluation_score")
    private Long score;

    @JsonProperty("evaluation_objective")
    private String objectiveId;

    public Long getScore() {
        return score;
    }

    public void setScore(Long score) {
        this.score = score;
    }

    public String getObjectiveId() {
        return objectiveId;
    }

    public void setObjectiveId(String objectiveId) {
        this.objectiveId = objectiveId;
    }
}
