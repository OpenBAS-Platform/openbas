package io.openbas.utils.fixtures;

import static io.openbas.database.model.Payload.PAYLOAD_SOURCE.COMMUNITY;
import static io.openbas.database.model.Payload.PAYLOAD_STATUS.UNVERIFIED;

import io.openbas.database.model.Document;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Payload;
import io.openbas.database.model.PlatformArchitecture;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import io.openbas.rest.payload.form.PayloadUpsertInput;
import java.util.Collections;

public class PayloadInputFixture {

  public static PayloadCreateInput createDefaultPayloadCreateInputForCommandLine() {
    PayloadCreateInput input = new PayloadCreateInput();
    input.setType("Command");
    input.setName("Command line payload");
    input.setDescription("This does something, maybe");
    input.setSource(Payload.PAYLOAD_SOURCE.MANUAL);
    input.setStatus(Payload.PAYLOAD_STATUS.VERIFIED);
    input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Linux});
    input.setAttackPatternsIds(Collections.emptyList());
    input.setTagIds(Collections.emptyList());
    input.setExecutableArch(PlatformArchitecture.x86_64);
    input.setExecutor("bash");
    input.setContent("echo hello");
    return input;
  }

  public static PayloadCreateInput createDefaultPayloadCreateInputForExecutable() {
    PayloadCreateInput input = new PayloadCreateInput();
    input.setType("Executable");
    input.setName("My Executable Payload");
    input.setDescription("Executable description");
    input.setSource(Payload.PAYLOAD_SOURCE.MANUAL);
    input.setStatus(Payload.PAYLOAD_STATUS.VERIFIED);
    input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Linux});
    input.setAttackPatternsIds(Collections.emptyList());
    input.setTagIds(Collections.emptyList());
    input.setExecutableArch(PlatformArchitecture.x86_64);
    return input;
  }

  public static PayloadUpdateInput getDefaultExecutablePayloadUpdateInput() {
    PayloadUpdateInput updateInput = new PayloadUpdateInput();
    updateInput.setName("My Updated Executable Payload");
    updateInput.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS});
    updateInput.setExecutableArch(PlatformArchitecture.arm64);
    return updateInput;
  }

  public static PayloadUpsertInput getDefaultCommandPayloadUpsertInput() {
    PayloadUpsertInput input = new PayloadUpsertInput();
    input.setType("Command");
    input.setName("My Command Payload");
    input.setDescription("Command description");
    input.setContent("cd ..");
    input.setExecutor("PowerShell");
    input.setSource(COMMUNITY);
    input.setStatus(UNVERIFIED);
    input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS});
    input.setExecutableArch(PlatformArchitecture.arm64);
    return input;
  }

  public static Document createDefaultExecutableFile() {
    Document executableFile = new Document();
    executableFile.setName("Executable file");
    executableFile.setType("text/x-sh");
    return executableFile;
  }

  public static PayloadUpsertInput createDefaultPayloadUpsertInputForCommandLine() {
    PayloadUpsertInput input = new PayloadUpsertInput();
    input.setType("Command");
    input.setName("Command line payload");
    input.setDescription("Command line description");
    input.setSource(Payload.PAYLOAD_SOURCE.COMMUNITY);
    input.setStatus(Payload.PAYLOAD_STATUS.UNVERIFIED);
    input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Linux});
    input.setAttackPatternsExternalIds(Collections.emptyList());
    input.setTagIds(Collections.emptyList());
    input.setExecutor("sh");
    input.setContent("ufw prepend deny from 1.2.3.4\n" + "ufw status numbered\n");
    input.setExecutableArch(PlatformArchitecture.arm64);
    return input;
  }

  public static PayloadUpdateInput getDefaultCommandPayloadUpdateInput() {
    PayloadUpdateInput input = new PayloadUpdateInput();
    input.setName("Updated Command line payload");
    input.setDescription("Command line description");
    input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS});
    input.setTagIds(Collections.emptyList());
    input.setExecutor("sh");
    input.setContent("ufw prepend deny from 1.2.3.4\n" + "ufw status numbered\n");
    input.setExecutableArch(PlatformArchitecture.arm64);
    return input;
  }
}
