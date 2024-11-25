package io.openbas.utils.fixtures;

import static io.openbas.database.model.Command.COMMAND_TYPE;
import static io.openbas.database.model.DnsResolution.DNS_RESOLUTION_TYPE;
import static io.openbas.database.model.Payload.PAYLOAD_SOURCE.MANUAL;
import static io.openbas.database.model.Payload.PAYLOAD_STATUS.VERIFIED;

import io.openbas.database.model.*;
import jakarta.annotation.Nullable;
import java.util.Collections;
import java.util.List;

public class PayloadFixture {

  private static final Endpoint.PLATFORM_TYPE[] LINUX_PLATFORM = {Endpoint.PLATFORM_TYPE.Linux};
  private static final Endpoint.PLATFORM_TYPE[] MACOS_PLATFORM = {Endpoint.PLATFORM_TYPE.MacOS};
  private static final Endpoint.PLATFORM_TYPE[] WINDOWS_PLATFORM = {Endpoint.PLATFORM_TYPE.Windows};

  private static void initializeDefaultPayload(
      final Payload payload, final Endpoint.PLATFORM_TYPE[] platforms) {
    payload.setPlatforms(platforms);
    payload.setSource(MANUAL);
    payload.setStatus(VERIFIED);
    payload.setAttackPatterns(Collections.emptyList());
  }

  public static Payload createDefaultCommand() {
    return createCommand("PowerShell", "cd ..", null, null);
  }

  public static Command createCommand(
      String executor,
      String commandLine,
      @Nullable List<PayloadPrerequisite> prerequisites,
      @Nullable String cleanupCmd) {
    Command command = new Command("command-id", COMMAND_TYPE, "command payload");
    command.setContent(commandLine);
    command.setExecutor(executor);
    if (prerequisites != null) {
      command.setPrerequisites(prerequisites);
    }
    if (cleanupCmd != null) {
      command.setCleanupCommand(cleanupCmd);
      command.setCleanupExecutor(executor);
    }
    initializeDefaultPayload(command, WINDOWS_PLATFORM);
    command.setAttackPatterns(Collections.emptyList());
    return command;
  }

  public static Payload createDefaultDnsResolution() {
    final DnsResolution dnsResolution =
        new DnsResolution("dns-resolution-id", DNS_RESOLUTION_TYPE, "dns resolution payload");
    dnsResolution.setHostname("localhost");
    initializeDefaultPayload(dnsResolution, LINUX_PLATFORM);
    return dnsResolution;
  }

  public static Payload createDefaultExecutable() {
    final Executable executable =
        new Executable("executable-id", Executable.EXECUTABLE_TYPE, "executable payload");
    executable.setExecutionArch(Payload.PAYLOAD_EXECUTION_ARCH.ARM64);
    initializeDefaultPayload(executable, MACOS_PLATFORM);
    return executable;
  }
}
