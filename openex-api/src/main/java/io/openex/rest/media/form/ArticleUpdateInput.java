package io.openex.rest.media.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class ArticleUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("article_name")
    private String name;

    @JsonProperty("article_header")
    private String header;

    @JsonProperty("article_content")
    private String content;

    @JsonProperty("article_footer")
    private String footer;

    @JsonProperty("article_published")
    private boolean published;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("article_media")
    private String mediaId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHeader() {
        return header;
    }

    public void setHeader(String header) {
        this.header = header;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getFooter() {
        return footer;
    }

    public void setFooter(String footer) {
        this.footer = footer;
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
