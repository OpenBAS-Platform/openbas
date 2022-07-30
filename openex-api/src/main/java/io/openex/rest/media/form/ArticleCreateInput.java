package io.openex.rest.media.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.rest.inject.form.InjectDocumentInput;

import javax.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class ArticleCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("article_name")
    private String name;

    @JsonProperty("article_content")
    private String content;

    @JsonProperty("article_author")
    private String author;

    @JsonProperty("article_shares")
    private Integer shares;

    @JsonProperty("article_likes")
    private Integer likes;

    @JsonProperty("article_comments")
    private Integer comments;

    @JsonProperty("article_documents")
    private List<String> documents = new ArrayList<>();

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("article_media")
    private String mediaId;

    @JsonProperty("article_published")
    private boolean published;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Integer getShares() {
        return shares;
    }

    public void setShares(Integer shares) {
        this.shares = shares;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes;
    }

    public Integer getComments() {
        return comments;
    }

    public void setComments(Integer comments) {
        this.comments = comments;
    }

    public List<String> getDocuments() {
        return documents;
    }

    public void setDocuments(List<String> documents) {
        this.documents = documents;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public String getMediaId() {
        return mediaId;
    }

    public void setMediaId(String mediaId) {
        this.mediaId = mediaId;
    }
}
