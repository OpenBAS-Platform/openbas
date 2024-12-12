package io.openbas.injectors.openbas.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.model.inject.form.Expectation;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OpenBASImplantInjectContent {

  @JsonProperty("obfuscator")
  private String obfuscator;

  @JsonProperty("expectations")
  private List<Expectation> expectations = new ArrayList<>();

  public static String getDefaultObfuscator() {
    return "base64";
  }

  public static List<String> getObfuscatorList() {
    return List.of("base64", "plain-text");
  }
}
