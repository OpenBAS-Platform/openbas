package io.openex.injects.channel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.email.model.EmailContent;
import io.openex.model.inject.form.Expectation;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class ChannelContent extends EmailContent {

  @JsonProperty("articles")
  private List<String> articles = new ArrayList<>();

  @JsonProperty("expectations")
  private List<Expectation> expectations = new ArrayList<>();

  @JsonProperty("emailing")
  private boolean emailing;

}
