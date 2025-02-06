package io.openbas.utils;

import jakarta.validation.constraints.NotBlank;

public class StringUtils {

  private StringUtils() {}

  public static final int MAX_SIZE_OF_STRING = 255;

  public static String duplicateString(@NotBlank final String originName) {
    String newName = originName + " (duplicate)";
    if (newName.length() > MAX_SIZE_OF_STRING) {
      newName = newName.substring(0, (MAX_SIZE_OF_STRING - 1) - " (duplicate)".length());
    }
    return newName;
  }
}
