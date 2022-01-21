package io.openex.rest.poll.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AnswerCreateInput {

    @JsonProperty("answer_content")
    private String content;

    @JsonProperty("answer_evaluation")
    private Long evaluation;

    @JsonProperty("answer_poll")
    private String pollId;

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

    public String getPollId() {
        return pollId;
    }

    public void setPollId(String pollId) {
        this.pollId = pollId;
    }
}
