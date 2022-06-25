package io.openex.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class InjectExpectationInput {

    @JsonProperty("inject_expectation_id")
    private String id;

    @JsonProperty("inject_expectation_type")
    private String type;

    @JsonProperty("inject_expectation_document")
    private String document;

    // Only filled for type = ARTICLE
    @JsonProperty("inject_expectation_article")
    private String articleId;

    // Only filled for type = CHALLENGE
    @JsonProperty("inject_expectation_challenge")
    private String challengeId;


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }

    public String getArticleId() {
        return articleId;
    }

    public void setArticleId(String articleId) {
        this.articleId = articleId;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }
}
