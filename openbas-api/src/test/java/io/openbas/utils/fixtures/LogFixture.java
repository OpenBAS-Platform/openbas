package io.openbas.utils.fixtures;

import io.openbas.rest.log.form.LogDetailsInput;

public class LogFixture {

  public static LogDetailsInput getDefaultLogDetailsInput(String level) {
    return LogDetailsInput.builder()
        .message(
            "Message error received: [@formatjs/intl] An `id` must be provided to format a message.")
        .stack("tt")
        .level(level)
        .build();
  }
}
