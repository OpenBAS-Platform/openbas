package io.openex.rest.poll.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PollCreateInput {

    @JsonProperty("poll_question")
    private String question;

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}
