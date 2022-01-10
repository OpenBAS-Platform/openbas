package io.openex.injects.manual.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

public class ManualContent {

    @JsonProperty("content")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ManualContent that = (ManualContent) o;
        return content.equals(that.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(content);
    }
}
