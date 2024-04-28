package io.openbas.injects.challenge.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.injects.email.model.EmailContent;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ChallengeContent extends EmailContent {

  @JsonProperty("challenges")
  private List<String> challenges = new ArrayList<>();

}
