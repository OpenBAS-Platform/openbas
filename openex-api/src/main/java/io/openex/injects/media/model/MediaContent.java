package io.openex.injects.media.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.email.model.EmailContent;

public class MediaContent extends EmailContent {

    @JsonProperty("article_id")
    private String articleId;

    @JsonProperty("expectation")
    private boolean expectation;

    public String getArticleId() {
        return articleId;
    }

    public void setArticleId(String articleId) {
        this.articleId = articleId;
    }

    public boolean isExpectation() {
        return expectation;
    }

    public void setExpectation(boolean expectation) {
        this.expectation = expectation;
    }
}
