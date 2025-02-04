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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Log
public class PayloadMapper {

  private final ApplicationContext context;

  public StatusPayloadOutput getStatusPayloadOutputFromInject(Optional<Inject> inject) {
    StatusPayloadOutput.StatusPayloadOutputBuilder statusPayloadOutputBuilder =
        StatusPayloadOutput.builder();
    StatusPayloadOutput result = statusPayloadOutputBuilder.build();
    if (inject.isPresent()) {
      Optional<InjectorContract> injectorContractOpt = inject.get().getInjectorContract();
      if (injectorContractOpt.isPresent()) {
        InjectorContract injectorContract = injectorContractOpt.get();

        if (ofNullable(inject.get().getContent())
            .map(c -> c.has("obfuscator"))
            .orElse(Boolean.FALSE)) {
          String obfuscator = inject.get().getContent().findValue("obfuscator").asText();
          statusPayloadOutputBuilder.obfuscator(obfuscator);
        }

        Optional<InjectStatus> injectStatus = inject.get().getStatus();
        StatusPayload statusPayload;
        Payload payload = injectorContract.getPayload();

        if (injectStatus.isEmpty() || injectStatus.get().getPayloadOutput() == null) {

          if (payload != null) {
            statusPayloadOutputBuilder
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

            if (COMMAND_TYPE.equals(payload.getType())) {
              Command payloadCommand = (Command) Hibernate.unproxy(payload);
              List<String> cleanupCommands = new ArrayList<>();

              if (payloadCommand.getCleanupCommand() != null) {
                cleanupCommands.add(payloadCommand.getCleanupCommand());
              }

              List<PayloadCommandBlock> payloadCommandBlocks = new ArrayList<>();
              PayloadCommandBlock payloadCommandBlock =
                  new PayloadCommandBlock(
                      payloadCommand.getExecutor(), payloadCommand.getContent(), cleanupCommands);
              payloadCommandBlocks.add(payloadCommandBlock);
              statusPayloadOutputBuilder.payloadCommandBlocks(payloadCommandBlocks);

            } else if (EXECUTABLE_TYPE.equals(payload.getType())) {

              Executable payloadExecutable = (Executable) Hibernate.unproxy(payload);
              statusPayloadOutputBuilder.executableFile(payloadExecutable.getExecutableFile());

            } else if (FILE_DROP_TYPE.equals(payload.getType())) {

              FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(payload);
              statusPayloadOutputBuilder.fileDropFile(payloadFileDrop.getFileDropFile());

            } else if (DNS_RESOLUTION_TYPE.equals(payload.getType())) {

              DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(payload);
              statusPayloadOutputBuilder.hostname(payloadDnsResolution.getHostname());

            } else if (NETWORK_TRAFFIC_TYPE.equals(payload.getType())) {

              NetworkTraffic payloadNetworkTraffic = (NetworkTraffic) Hibernate.unproxy(payload);
              statusPayloadOutputBuilder
                  .protocol(payloadNetworkTraffic.getProtocol())
                  .portSrc(payloadNetworkTraffic.getPortSrc())
                  .portDst(payloadNetworkTraffic.getPortDst())
                  .ipSrc(payloadNetworkTraffic.getIpSrc())
                  .ipDst(payloadNetworkTraffic.getIpDst());
            }

            result = statusPayloadOutputBuilder.build();

          } else {
            try {
              // Inject comes from Caldera ability and tomorrow from other(s) Executor(s)
              io.openbas.executors.Injector executor =
                  context.getBean(
                      injectorContract.getInjector().getType(),
                      io.openbas.executors.Injector.class);
              statusPayload = executor.getPayloadOutput(injectorContract.getId());

              result =
                  statusPayloadOutputBuilder
                      .arguments(statusPayload.getArguments())
                      .prerequisites(statusPayload.getPrerequisites())
                      .externalId(statusPayload.getExternalId())
                      .cleanupExecutor(statusPayload.getCleanupExecutor())
                      .payloadCommandBlocks(statusPayload.getPayloadCommandBlocks())
                      .type(statusPayload.getPayloadCommandBlocks().isEmpty() ? null : COMMAND_TYPE)
                      .hostname(statusPayload.getHostname())
                      .ipSrc(statusPayload.getIpSrc())
                      .ipDst(statusPayload.getIpDst())
                      .portDst(statusPayload.getPortDst())
                      .portSrc(statusPayload.getPortSrc())
                      .protocol(statusPayload.getProtocol())
                      .attackPatterns(toAttackPatternSimples(injectorContract.getAttackPatterns()))
                      .executableArch(injectorContract.getArch())
                      .build();

            } catch (NoSuchBeanDefinitionException e) {
              log.info(
                  "No executor found for this injector: "
                      + injectorContract.getInjector().getType());
              return null;
            }
          }
        } else if (injectStatus.isPresent()) {

          if (injectStatus.get().getPayloadOutput() != null) {

            // Commands lines saved because inject has been executed
            statusPayload = injectStatus.get().getPayloadOutput();

            statusPayloadOutputBuilder
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
                .executableArch(injectorContract.getArch());

            if (payload != null) {
              statusPayloadOutputBuilder
                  .name(payload.getName())
                  .type(payload.getType())
                  .collectorType(payload.getCollectorType())
                  .description(payload.getDescription())
                  .platforms(payload.getPlatforms());
            } else {
              statusPayloadOutputBuilder.type(
                  statusPayload.getPayloadCommandBlocks().isEmpty() ? null : COMMAND_TYPE);
            }
          }
          result = statusPayloadOutputBuilder.build();
        }
      }
    }
    return result;
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
