package io.openbas.rest.challenge.form;

import static io.openbas.config.AppConfig.EMPTY_MESSAGE;
import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

public class ChallengeUpdateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("challenge_name")
  private String name;

  @JsonProperty("challenge_category")
  private String category;

  @JsonProperty("challenge_content")
  private String content;

  @JsonProperty("challenge_score")
  private Integer score;

  @JsonProperty("challenge_max_attempts")
  private Integer maxAttempts;

  @JsonProperty("challenge_tags")
  private List<String> tagIds = new ArrayList<>();

  @JsonProperty("challenge_documents")
  private List<String> documentIds = new ArrayList<>();

  @NotEmpty(message = EMPTY_MESSAGE)
  @JsonProperty("challenge_flags")
  private List<FlagInput> flags = new ArrayList<>();

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

  public List<String> getTagIds() {
    return tagIds;
  }

  public void setTagIds(List<String> tagIds) {
    this.tagIds = tagIds;
  }

  public List<String> getDocumentIds() {
    return documentIds;
  }

  public void setDocumentIds(List<String> documentIds) {
    this.documentIds = documentIds;
  }

  public List<FlagInput> getFlags() {
    return flags;
  }

  public void setFlags(List<FlagInput> flags) {
    this.flags = flags;
  }
}
