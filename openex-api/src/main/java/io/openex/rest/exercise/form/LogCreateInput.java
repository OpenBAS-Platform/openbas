package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LogCreateInput {

    @JsonProperty("log_title")
    private String title;

    @JsonProperty("log_content")
    private String content;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
