package io.openbas.rest.challenge.form;

import static io.openbas.config.AppConfig.EMPTY_MESSAGE;
import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class ChallengeInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("challenge_name")
  private String name;

  @JsonProperty("challenge_category")
  private String category;

  @JsonProperty("challenge_content")
  private String content;

  @JsonProperty("challenge_score")
  private Double score;

  @JsonProperty("challenge_max_attempts")
  private Integer maxAttempts;

  @JsonProperty("challenge_tags")
  private List<String> tagIds = new ArrayList<>();

  @JsonProperty("challenge_documents")
  private List<String> documentIds = new ArrayList<>();

  @NotEmpty(message = EMPTY_MESSAGE)
  @JsonProperty("challenge_flags")
  private List<FlagInput> flags = new ArrayList<>();
}
