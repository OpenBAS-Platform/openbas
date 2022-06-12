package io.openex.injects.media.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MediaContent {

    @JsonProperty("article_id")
    private String articleId;

    public String getArticleId() {
        return articleId;
    }

    public void setArticleId(String articleId) {
        this.articleId = articleId;
    }
}
