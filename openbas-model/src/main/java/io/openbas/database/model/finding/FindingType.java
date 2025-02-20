package io.openbas.database.model.finding;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import org.jetbrains.annotations.NotNull;

public class FindingType {

  public static final String TEXT_VALUE = "Text";
  public static final String IPV6_VALUE = "IPV6";
  public static final String CREDENTIALS_VALUE = "Credentials";

  @Getter
  public enum ValueType {
    @JsonProperty(TEXT_VALUE)
    TEXT(TEXT_VALUE),
    @JsonProperty(IPV6_VALUE)
    IPV6(IPV6_VALUE),
    @JsonProperty(CREDENTIALS_VALUE)
    CREDENTIALS(CREDENTIALS_VALUE);

    private final String value;

    ValueType(@NotNull final String value) {
      this.value = value;
    }

  }
}
