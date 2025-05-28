package io.openbas.executors;

import io.openbas.database.model.Endpoint.PLATFORM_TYPE;

public class ExecutorHelper {

  public static final String WINDOWS_LOCATION_PATH = "$PWD.Path";
  public static final String UNIX_LOCATION_PATH = "$(pwd)";
  public static final String IMPLANT_BASE_NAME = "implant-";

  private ExecutorHelper() {}

  public static String replaceArgs(
      PLATFORM_TYPE platformType, String command, String executionId, String agentId) {
    if (platformType == null || command == null || executionId == null || agentId == null) {
      throw new IllegalArgumentException(
          "Platform type, command, injectId, and agentId must not be null.");
    }

    String location =
        switch (platformType) {
          case Windows -> WINDOWS_LOCATION_PATH;
          case Linux, MacOS -> UNIX_LOCATION_PATH;
          default ->
              throw new IllegalArgumentException("Unsupported platform type: " + platformType);
        };

    return command
        .replace("\"#{location}\"", location)
        .replace("#{inject}", executionId)
        .replace("#{agent}", agentId);
  }
}
