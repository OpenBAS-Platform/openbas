package io.openex.rest.poll.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AnswerInput {

    @JsonProperty("answer_content")
    private String content;

    @JsonProperty("answer_evaluation")
    private Long evaluation;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(Long evaluation) {
        this.evaluation = evaluation;
    }
}
