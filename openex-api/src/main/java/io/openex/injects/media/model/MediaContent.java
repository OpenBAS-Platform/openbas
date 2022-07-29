package io.openex.injects.media.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.email.model.EmailContent;

import java.util.ArrayList;
import java.util.List;

public class MediaContent extends EmailContent {

    @JsonProperty("articles")
    private List<String> articles = new ArrayList<>();

    @JsonProperty("expectation")
    private boolean expectation;

    public List<String> getArticles() {
        return articles;
    }

    public void setArticles(List<String> articles) {
        this.articles = articles;
    }

    public boolean isExpectation() {
        return expectation;
    }

    public void setExpectation(boolean expectation) {
        this.expectation = expectation;
    }
}
