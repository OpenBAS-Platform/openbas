package io.openbas.utils;

import io.openbas.database.model.*;
import io.openbas.rest.atomic_testing.form.StatusPayloadOutput;
import io.openbas.rest.payload.output.output_parser.ContractOutputElementSimple;
import io.openbas.rest.payload.output.output_parser.OutputParserSimple;
import io.openbas.rest.payload.output.output_parser.RegexGroupSimple;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static io.openbas.database.model.Command.COMMAND_TYPE;
import static io.openbas.database.model.DnsResolution.DNS_RESOLUTION_TYPE;
import static io.openbas.database.model.Executable.EXECUTABLE_TYPE;
import static io.openbas.database.model.FileDrop.FILE_DROP_TYPE;
import static java.util.Optional.ofNullable;

@RequiredArgsConstructor
@Component
@Slf4j
public class PayloadMapper {

  public StatusPayloadOutput getStatusPayloadOutputFromInject(Optional<Inject> inject) {

    if (inject.isEmpty()) {
      return null;
    }

    Inject injectObj = inject.get();
    Optional<InjectorContract> injectorContractOpt = injectObj.getInjectorContract();
    if (injectorContractOpt.isEmpty() || injectorContractOpt.get().getPayload() == null) {
      return null;
    }

    InjectorContract injectorContract = injectorContractOpt.get();
    StatusPayloadOutput.StatusPayloadOutputBuilder statusPayloadOutputBuilder =
        StatusPayloadOutput.builder();

    if (ofNullable(inject.get().getContent()).map(c -> c.has("obfuscator")).orElse(Boolean.FALSE)) {
      String obfuscator = inject.get().getContent().findValue("obfuscator").asText();
      statusPayloadOutputBuilder.obfuscator(obfuscator);
    }

    Optional<InjectStatus> injectStatusOpt = injectObj.getStatus();
    Payload payload = injectorContract.getPayload();

    // Handle the case when inject has not been executed yet or no payload output exists
    if (injectStatusOpt.isEmpty() || injectStatusOpt.get().getPayloadOutput() == null) {
      if (payload != null) {
        populatePayloadDetails(statusPayloadOutputBuilder, payload, injectorContract);

        // Handle different payload types
        processPayloadType(statusPayloadOutputBuilder, payload);
        return statusPayloadOutputBuilder.build();
      } else {
        return null;
      }
    }

    // If inject has been executed, reuse the previous status
    return injectStatusOpt
        .map(InjectStatus::getPayloadOutput)
        .map(
            statusPayload ->
                populateExecutedPayload(
                    statusPayloadOutputBuilder, statusPayload, injectorContract))
        .orElse(null);
  }

  private Set<RegexGroupSimple> toRegexGroupSimple(Set<RegexGroup> regexGroups) {
    return regexGroups.stream()
        .map(
            regexGroup ->
                RegexGroupSimple.builder()
                    .id(regexGroup.getId())
                    .field(regexGroup.getField())
                    .indexValues(regexGroup.getIndexValues())
                    .build())
        .collect(Collectors.toSet());
  }

  private Set<ContractOutputElementSimple> toContractOutputElementsSimple(
      Set<ContractOutputElement> contractElements) {
    return contractElements.stream()
        .map(
            contractElement ->
                ContractOutputElementSimple.builder()
                    .id(contractElement.getId())
                    .rule(contractElement.getRule())
                    .name(contractElement.getName())
                    .key(contractElement.getKey())
                    .type(contractElement.getType())
                    .tagIds(contractElement.getTags().stream().map(Tag::getId).toList())
                    .regexGroups(toRegexGroupSimple(contractElement.getRegexGroups()))
                    .build())
        .collect(Collectors.toSet());
  }

  private Set<OutputParserSimple> toOutputParsersSimple(Set<OutputParser> outputParsers) {
    return outputParsers.stream()
        .map(
            parser ->
                OutputParserSimple.builder()
                    .id(parser.getId())
                    .mode(parser.getMode())
                    .type(parser.getType())
                    .contractOutputElement(
                        toContractOutputElementsSimple(parser.getContractOutputElements()))
                    .build())
        .collect(Collectors.toSet());
  }

  private void populatePayloadDetails(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder,
      Payload payload,
      InjectorContract injectorContract) {
    builder
        .arguments(payload.getArguments())
        .prerequisites(payload.getPrerequisites())
        .externalId(payload.getExternalId())
        .cleanupExecutor(payload.getCleanupExecutor())
        .name(payload.getName())
        .type(payload.getType())
        .collectorType(payload.getCollectorType())
        .description(payload.getDescription())
        .tags(payload.getTags().stream().map(Tag::getId).collect(Collectors.toSet()))
        .platforms(payload.getPlatforms())
        .payloadOutputParsers(toOutputParsersSimple(payload.getOutputParsers()))
        .attackPatterns(injectorContract.getAttackPatterns().stream().map(AttackPattern::getId).toList())
        .executionArch(injectorContract.getArch());
  }

  private void processPayloadType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder, Payload payload) {
    switch (payload.getType()) {
      case COMMAND_TYPE:
        handleCommandType(builder, (Command) Hibernate.unproxy(payload));
        break;
      case EXECUTABLE_TYPE:
        handleExecutableType(builder, (Executable) Hibernate.unproxy(payload));
        break;
      case FILE_DROP_TYPE:
        handleFileDropType(builder, (FileDrop) Hibernate.unproxy(payload));
        break;
      case DNS_RESOLUTION_TYPE:
        handleDnsResolutionType(builder, (DnsResolution) Hibernate.unproxy(payload));
        break;
      default:
        break;
    }
  }

  private void handleCommandType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder, Command payloadCommand) {
    List<String> cleanupCommands = new ArrayList<>();
    if (payloadCommand.getCleanupCommand() != null) {
      cleanupCommands.add(payloadCommand.getCleanupCommand());
    }
    builder.executor(payloadCommand.getExecutor())
        .content(payloadCommand.getContent())
        .cleanupCommand(cleanupCommands);
  }

  private void handleExecutableType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder, Executable payloadExecutable) {
    builder.executableFile(payloadExecutable.getExecutableFile().getId());
  }

  private void handleFileDropType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder, FileDrop payloadFileDrop) {
    builder.fileDropFile(payloadFileDrop.getFileDropFile().getId());
  }

  private void handleDnsResolutionType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder, DnsResolution payloadDnsResolution) {
    builder.hostname(payloadDnsResolution.getHostname());
  }

  private StatusPayloadOutput populateExecutedPayload(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder,
      StatusPayload statusPayload,
      InjectorContract injectorContract) {
    builder
        .cleanupExecutor(statusPayload.getCleanupExecutor())
        .executor(statusPayload.getExecutor())
        .content(statusPayload.getContent())
        .arguments(statusPayload.getArguments())
        .prerequisites(statusPayload.getPrerequisites())
        .externalId(statusPayload.getExternalId())
        .executableFile(statusPayload.getExecutableFile())
        .fileDropFile(statusPayload.getFileDropFile())
        .hostname(statusPayload.getHostname())
        .attackPatterns(injectorContract.getAttackPatterns().stream().map(AttackPattern::getId).toList())
        .executionArch(injectorContract.getArch())
        .name(statusPayload.getName())
        .type(statusPayload.getType())
        .description(statusPayload.getDescription())
        .platforms(injectorContract.getPlatforms());

    Payload payload = injectorContract.getPayload();
    if (payload != null) {
      builder
          .collectorType(payload.getCollectorType())
          .payloadOutputParsers(toOutputParsersSimple(payload.getOutputParsers()))
          .tags(payload.getTags().stream().map(Tag::getId).collect(Collectors.toSet()));
    }

    return builder.build();
  }
}
