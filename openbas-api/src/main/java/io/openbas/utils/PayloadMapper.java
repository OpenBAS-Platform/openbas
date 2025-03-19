package io.openbas.utils;

import static io.openbas.database.model.Command.COMMAND_TYPE;
import static io.openbas.database.model.DnsResolution.DNS_RESOLUTION_TYPE;
import static io.openbas.database.model.Executable.EXECUTABLE_TYPE;
import static io.openbas.database.model.FileDrop.FILE_DROP_TYPE;
import static io.openbas.database.model.NetworkTraffic.NETWORK_TRAFFIC_TYPE;
import static java.util.Optional.ofNullable;

import io.openbas.database.model.*;
import io.openbas.rest.atomic_testing.form.AttackPatternSimple;
import io.openbas.rest.atomic_testing.form.StatusPayloadOutput;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Log
public class PayloadMapper {

  private final ApplicationContext context;

  public StatusPayloadOutput getStatusPayloadOutputFromInject(Optional<Inject> inject) {

    if (inject.isEmpty()) return null;

    Inject injectObj = inject.get();
    Optional<InjectorContract> injectorContractOpt = injectObj.getInjectorContract();
    if (injectorContractOpt.isEmpty() || injectorContractOpt.get().getPayload() == null)
      return null;

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
        .platforms(payload.getPlatforms())
        .attackPatterns(toAttackPatternSimples(injectorContract.getAttackPatterns()))
        .executableArch(injectorContract.getArch());
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
      case NETWORK_TRAFFIC_TYPE:
        handleNetworkTrafficType(builder, (NetworkTraffic) Hibernate.unproxy(payload));
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

    PayloadCommandBlock commandBlock =
        new PayloadCommandBlock(
            payloadCommand.getExecutor(), payloadCommand.getContent(), cleanupCommands);
    builder.payloadCommandBlocks(Collections.singletonList(commandBlock));
  }

  private void handleExecutableType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder, Executable payloadExecutable) {
    builder.executableFile(new StatusPayloadDocument(payloadExecutable.getExecutableFile()));
  }

  private void handleFileDropType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder, FileDrop payloadFileDrop) {
    builder.fileDropFile(new StatusPayloadDocument(payloadFileDrop.getFileDropFile()));
  }

  private void handleDnsResolutionType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder, DnsResolution payloadDnsResolution) {
    builder.hostname(payloadDnsResolution.getHostname());
  }

  private void handleNetworkTrafficType(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder,
      NetworkTraffic payloadNetworkTraffic) {
    builder
        .protocol(payloadNetworkTraffic.getProtocol())
        .portSrc(payloadNetworkTraffic.getPortSrc())
        .portDst(payloadNetworkTraffic.getPortDst())
        .ipSrc(payloadNetworkTraffic.getIpSrc())
        .ipDst(payloadNetworkTraffic.getIpDst());
  }

  private StatusPayloadOutput populateExecutedPayload(
      StatusPayloadOutput.StatusPayloadOutputBuilder builder,
      StatusPayload statusPayload,
      InjectorContract injectorContract) {
    builder
        .cleanupExecutor(statusPayload.getCleanupExecutor())
        .payloadCommandBlocks(statusPayload.getPayloadCommandBlocks())
        .arguments(statusPayload.getArguments())
        .prerequisites(statusPayload.getPrerequisites())
        .externalId(statusPayload.getExternalId())
        .executableFile(statusPayload.getExecutableFile())
        .fileDropFile(statusPayload.getFileDropFile())
        .hostname(statusPayload.getHostname())
        .ipSrc(statusPayload.getIpSrc())
        .ipDst(statusPayload.getIpDst())
        .portSrc(statusPayload.getPortSrc())
        .portDst(statusPayload.getPortDst())
        .protocol(statusPayload.getProtocol())
        .attackPatterns(toAttackPatternSimples(injectorContract.getAttackPatterns()))
        .executableArch(injectorContract.getArch())
        .name(statusPayload.getName())
        .type(statusPayload.getType())
        .description(statusPayload.getDescription())
        .platforms(injectorContract.getPlatforms());

    Payload payload = injectorContract.getPayload();
    if (payload != null) {
      builder.collectorType(payload.getCollectorType());
    }

    return builder.build();
  }

  public List<AttackPatternSimple> toAttackPatternSimples(List<AttackPattern> attackPatterns) {
    return attackPatterns.stream()
        .filter(Objects::nonNull)
        .map(this::toAttackPatternSimple)
        .toList();
  }

  private AttackPatternSimple toAttackPatternSimple(AttackPattern attackPattern) {
    return AttackPatternSimple.builder()
        .id(attackPattern.getId())
        .name(attackPattern.getName())
        .externalId(attackPattern.getExternalId())
        .build();
  }
}
