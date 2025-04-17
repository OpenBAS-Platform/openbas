package io.openbas.utils;

import jakarta.validation.constraints.NotBlank;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

public class StringUtils {

  public static final int MAX_SIZE_OF_STRING = 255;

  public static String duplicateString(@NotBlank final String originName) {
    String newName = originName + " (duplicate)";
    if (newName.length() > MAX_SIZE_OF_STRING) {
      newName = newName.substring(0, (MAX_SIZE_OF_STRING - 1) - " (duplicate)".length());
    }
    return newName;
  }

  public static boolean isValidRegex(String regex) {
    try {
      Pattern.compile(regex);
      return true;
    } catch (PatternSyntaxException e) {
      return false;
    }
  }
}
