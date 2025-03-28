package io.openbas.utils;

import io.openbas.rest.log.form.LogDetailsInput;

public class LogUtils {

  public enum LogLevel {
    INFO,
    WARN,
    DEBUG,
    ERROR;
  }

  public static LogLevel fromString(String level) {
    try {
      return LogLevel.valueOf(level.toUpperCase());
    } catch (IllegalArgumentException e) {
      return LogLevel.ERROR;
    }
  }

  public static String buildLogMessage(LogDetailsInput logDetailsInput, LogLevel level) {
    return "Message "
        + level
        + " received: "
        + logDetailsInput.getMessage()
        + " stacktrace: "
        + logDetailsInput.getStack();
  }
}
