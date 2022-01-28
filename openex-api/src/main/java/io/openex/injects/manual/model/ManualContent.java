package io.openex.injects.manual.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.InjectContent;

import java.util.Objects;

public class ManualContent extends InjectContent {

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
        return Objects.equals(content, that.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(content);
    }
}
