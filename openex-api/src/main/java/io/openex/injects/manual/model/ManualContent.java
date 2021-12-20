package io.openex.injects.manual.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ManualContent {

    @JsonProperty("content")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
