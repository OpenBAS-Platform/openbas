package io.openbas.injectors.caldera.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.model.inject.form.Expectation;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CalderaInjectContent {

  @JsonProperty("obfuscator")
  private String obfuscator;

  @JsonProperty("expectations")
  private List<Expectation> expectations = new ArrayList<>();

}
