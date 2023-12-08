package io.openex.injects.media.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.email.model.EmailContent;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class MediaContent extends EmailContent {

  @JsonProperty("articles")
  private List<String> articles = new ArrayList<>();

  @JsonProperty("expectation")
  private boolean expectation;

  @JsonProperty("expectationScore")
  private Integer expectationScore;

  @JsonProperty("emailing")
  private boolean emailing;

}
