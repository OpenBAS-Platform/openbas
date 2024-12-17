package io.openbas.injectors.openbas.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.model.inject.form.Expectation;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    return "plain-text";
  }

  public static Map<String, String> getObfuscatorState() {
    Map<String, String> obfuscatorMap = new HashMap<>();
    obfuscatorMap.put("base64", "CMD does not support base64 obfuscation");
    obfuscatorMap.put("plain-text", "");
    return obfuscatorMap;
  }
}
