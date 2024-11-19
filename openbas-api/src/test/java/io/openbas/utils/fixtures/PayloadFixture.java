package io.openbas.utils.fixtures;

import static io.openbas.database.model.Command.COMMAND_TYPE;
import static io.openbas.database.model.DnsResolution.DNS_RESOLUTION_TYPE;
import static io.openbas.database.model.Payload.PAYLOAD_SOURCE.MANUAL;
import static io.openbas.database.model.Payload.PAYLOAD_STATUS.VERIFIED;

import io.openbas.database.model.*;
import java.util.Collections;

public class PayloadFixture {

  public static Payload createDefaultCommand() {
    Command command = new Command("command-id", COMMAND_TYPE, "command payload");
    command.setContent("cd ..");
    command.setExecutor("PowerShell");
    command.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Windows});
    command.setExecutableArch(PlatformArchitecture.x86_64);
    command.setSource(MANUAL);
    command.setStatus(VERIFIED);
    command.setAttackPatterns(Collections.emptyList());
    return command;
  }

  public static Payload createDefaultDnsResolution() {
    DnsResolution dnsResolution =
        new DnsResolution("dns-resolution-id", DNS_RESOLUTION_TYPE, "dns resolution payload");
    dnsResolution.setHostname("localhost");
    dnsResolution.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Linux});
    dnsResolution.setSource(MANUAL);
    dnsResolution.setStatus(VERIFIED);
    dnsResolution.setAttackPatterns(Collections.emptyList());
    return dnsResolution;
  }

  public static Payload createDefaultExecutable() {
    Executable executable =
        new Executable("executable-id", Executable.EXECUTABLE_TYPE, "executable payload");
    executable.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS});
    executable.setExecutableArch(PlatformArchitecture.arm64);
    executable.setSource(MANUAL);
    executable.setStatus(VERIFIED);
    executable.setAttackPatterns(Collections.emptyList());
    return executable;
  }
}
