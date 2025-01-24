package io.openbas.rest.exception;

import java.util.Map;
import lombok.Getter;

@Getter
public class DetailedException extends RuntimeException {
  private final Map<String, Object> additionalData;

  public DetailedException(String message, Map<String, Object> additionalData) {
    super(message);
    this.additionalData = additionalData;
  }
}
