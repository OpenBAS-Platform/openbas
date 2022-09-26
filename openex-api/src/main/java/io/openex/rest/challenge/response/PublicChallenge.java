package io.openex.rest.challenge.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Challenge;
import io.openex.database.model.Document;
import io.openex.database.model.Tag;

import java.time.Instant;
import java.util.List;

public class PublicChallenge {

    @JsonProperty("challenge_id")
    private String id;

    @JsonProperty("challenge_name")
    private String name;

    @JsonProperty("challenge_category")
    private String category;

    @JsonProperty("challenge_content")
    private String content;

    @JsonProperty("challenge_score")
    private Integer score;

    @JsonProperty("challenge_flags")
    private List<PublicChallengeFlag> flags;

    @JsonProperty("challenge_max_attempts")
    private Integer maxAttempts;

    @JsonProperty("challenge_tags")
    private List<String> tags;

    @JsonProperty("challenge_documents")
    private List<String> documents;

    @JsonProperty("challenge_virtual_publication")
    private Instant virtualPublication;

    public PublicChallenge(Challenge challenge) {
        this.id = challenge.getId();
        this.name = challenge.getName();
        this.category = challenge.getCategory();
        this.content = challenge.getContent();
        this.score = challenge.getScore();
        this.maxAttempts = challenge.getMaxAttempts();
        this.tags = challenge.getTags().stream().map(Tag::getId).toList();
        this.virtualPublication = challenge.getVirtualPublication();
        this.documents = challenge.getDocuments().stream().map(Document::getId).toList();
        this.flags = challenge.getFlags().stream().map(PublicChallengeFlag::new).toList();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(Integer maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getDocuments() {
        return documents;
    }

    public void setDocuments(List<String> documents) {
        this.documents = documents;
    }

    public Instant getVirtualPublication() {
        return virtualPublication;
    }

    public void setVirtualPublication(Instant virtualPublication) {
        this.virtualPublication = virtualPublication;
    }

    public List<PublicChallengeFlag> getFlags() {
        return flags;
    }

    public void setFlags(List<PublicChallengeFlag> flags) {
        this.flags = flags;
    }
}
