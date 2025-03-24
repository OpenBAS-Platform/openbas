package io.openbas.utils.fixtures;

import static io.openbas.database.model.Payload.PAYLOAD_SOURCE.COMMUNITY;
import static io.openbas.database.model.Payload.PAYLOAD_STATUS.UNVERIFIED;

import io.openbas.database.model.*;
import io.openbas.rest.payload.form.*;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.jetbrains.annotations.NotNull;

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
    input.setExecutor("bash");
    input.setContent("echo hello");
    return input;
  }

  public static PayloadCreateInput createDefaultPayloadCreateInputWithOutputParser() {
    PayloadCreateInput input = createDefaultPayloadCreateInputForCommandLine();

    RegexGroupInput regexGroupInput = new RegexGroupInput();
    regexGroupInput.setField("ipv6");
    regexGroupInput.setIndex(0);

    ContractOutputElementInput contractOutputElementInput = new ContractOutputElementInput();
    contractOutputElementInput.setKey("IPV6");
    contractOutputElementInput.setType(ContractOutputType.IPv6);
    contractOutputElementInput.setName("IPV6");
    contractOutputElementInput.setRule("rule");
    contractOutputElementInput.setTagIds(List.of("id"));
    contractOutputElementInput.setFinding(true);
    contractOutputElementInput.setRegexGroups(Set.of(regexGroupInput));

    OutputParserInput outputParserInput = new OutputParserInput();
    outputParserInput.setMode(ParserMode.STDOUT);
    outputParserInput.setType(ParserType.REGEX);
    outputParserInput.setContractOutputElements(Set.of(contractOutputElementInput));

    input.setOutputParsers(Set.of(outputParserInput));
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
    input.setExecutionArch(Payload.PAYLOAD_EXECUTION_ARCH.x86_64);
    return input;
  }

  public static PayloadUpdateInput getDefaultExecutablePayloadUpdateInput() {
    PayloadUpdateInput updateInput = new PayloadUpdateInput();
    updateInput.setName("My Updated Executable Payload");
    updateInput.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS});
    updateInput.setExecutionArch(Payload.PAYLOAD_EXECUTION_ARCH.arm64);
    return updateInput;
  }

  public static PayloadUpdateInput getDefaultCommandPayloadUpdateInput() {
    PayloadUpdateInput input = new PayloadUpdateInput();
    input.setName("Updated Command line payload");
    input.setDescription("Command line description");
    input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS});
    input.setTagIds(Collections.emptyList());
    input.setExecutor("sh");
    input.setContent("ufw prepend deny from 1.2.3.4\n" + "ufw status numbered\n");
    return input;
  }

  public static PayloadUpdateInput getDefaultCommandPayloadUpdateInputWithOutputParser() {
    PayloadUpdateInput input = getDefaultCommandPayloadUpdateInput();

    ContractOutputElementInput contractOutputElementInput = new ContractOutputElementInput();
    contractOutputElementInput.setKey("IPV6");
    contractOutputElementInput.setType(ContractOutputType.IPv6);
    contractOutputElementInput.setName("IPV6");
    contractOutputElementInput.setRule("rule");
    contractOutputElementInput.setTagIds(List.of("id"));
    contractOutputElementInput.setFinding(true);

    OutputParserInput outputParserInput = new OutputParserInput();
    outputParserInput.setMode(ParserMode.STDOUT);
    outputParserInput.setType(ParserType.REGEX);
    outputParserInput.setContractOutputElements(Set.of(contractOutputElementInput));

    input.setOutputParsers(Set.of(outputParserInput));
    return input;
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
    return input;
  }

  public static Document createDefaultExecutableFile() {
    Document executableFile = new Document();
    executableFile.setName("Executable file");
    executableFile.setType("text/x-sh");
    return executableFile;
  }

  public static PayloadUpsertInput getDefaultCommandPayloadUpsertInputWithOutputParser() {
    PayloadUpsertInput input = getDefaultCommandPayloadUpsertInput();

    ContractOutputElementInput contractOutputElementInput = getContractOutputElementInput();

    OutputParserInput outputParserInput = new OutputParserInput();
    outputParserInput.setMode(ParserMode.STDERR);
    outputParserInput.setType(ParserType.REGEX);
    outputParserInput.setContractOutputElements(Set.of(contractOutputElementInput));

    input.setOutputParsers(Set.of(outputParserInput));
    return input;
  }

  @NotNull
  private static ContractOutputElementInput getContractOutputElementInput() {
    RegexGroupInput regexGroupUserNameInput = new RegexGroupInput();
    regexGroupUserNameInput.setField("username");
    regexGroupUserNameInput.setIndex(1);

    ContractOutputElementInput contractOutputElementInput = new ContractOutputElementInput();
    contractOutputElementInput.setKey("credentials_user");
    contractOutputElementInput.setType(ContractOutputType.Credentials);
    contractOutputElementInput.setName("Credentials");
    contractOutputElementInput.setRule("regex xPath");
    contractOutputElementInput.setTagIds(List.of("id"));
    contractOutputElementInput.setFinding(true);
    contractOutputElementInput.setRegexGroups(Set.of(regexGroupUserNameInput));
    return contractOutputElementInput;
  }
}
