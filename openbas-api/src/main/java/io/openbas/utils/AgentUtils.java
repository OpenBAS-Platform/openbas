package io.openbas.utils;

import io.openbas.database.model.Endpoint;
import java.util.List;

public class AgentUtils {

  private AgentUtils() {}

  public static final List<String> AVAILABLE_PLATFORMS =
      List.of(
          Endpoint.PLATFORM_TYPE.Linux.name().toLowerCase(),
          Endpoint.PLATFORM_TYPE.Windows.name().toLowerCase(),
          Endpoint.PLATFORM_TYPE.MacOS.name().toLowerCase());

  public static final List<String> AVAILABLE_ARCHITECTURES =
      List.of(
          Endpoint.PLATFORM_ARCH.x86_64.name().toLowerCase(),
          Endpoint.PLATFORM_ARCH.arm64.name().toLowerCase());
}
