package io.openbas.injectors.channel.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.injectors.email.model.EmailContent;
import io.openbas.model.inject.form.Expectation;
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
