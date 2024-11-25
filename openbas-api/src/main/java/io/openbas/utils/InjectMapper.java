package io.openbas.utils;

import io.openbas.atomic_testing.TargetType;
import io.openbas.database.model.*;
import io.openbas.rest.atomic_testing.form.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InjectMapper {

  private final InjectUtils injectUtils;
  private final ResultUtils resultUtils;

  private final ApplicationContext context;

  public InjectResultOverviewOutput toInjectResultOverviewOutput(Inject inject) {
    // --
    Optional<InjectorContract> injectorContract = inject.getInjectorContract();

    List<String> documentIds =
        inject.getDocuments().stream()
            .map(InjectDocument::getDocument)
            .map(Document::getId)
            .toList();

    return InjectResultOverviewOutput.builder()
        .id(inject.getId())
        .title(inject.getTitle())
        .description(inject.getDescription())
        .content(inject.getContent())
        .payloadOutputDto(injectUtils.getCommandsLinesFromInject(inject))
        .type(injectorContract.map(contract -> contract.getInjector().getType()).orElse(null))
        .tagIds(inject.getTags().stream().map(Tag::getId).toList())
        .documentIds(documentIds)
        .injectorContract(toInjectorContractOutput(injectorContract))
        .status(toInjectStatusOutput(inject.getStatus()))
        .expectations(toInjectExpectationSimples(inject.getExpectations()))
        .killChainPhases(toKillChainPhasesSimples(inject.getKillChainPhases()))
        .attackPatterns(toAttackPatternSimples(inject.getAttackPatterns()))
        .isReady(inject.isReady())
        .updatedAt(inject.getUpdatedAt())
        .expectationResultByTypes(
            AtomicTestingUtils.getExpectationResultByTypes(
                injectUtils.getPrimaryExpectations(inject)))
        .targets(resultUtils.getInjectTargetWithResults(Set.of(inject.getId())))
        .build();
  }

  // -- OBJECT[] to TARGETSIMPLE --
  public List<TargetSimple> toTargetSimple(List<Object[]> targets, TargetType type) {
    return targets.stream()
        .filter(Objects::nonNull)
        .map(target -> toTargetSimple(target, type))
        .toList();
  }

  public TargetSimple toTargetSimple(Object[] target, TargetType type) {
    return TargetSimple.builder()
        .id((String) target[1])
        .name((String) target[2])
        .type(type)
        .build();
  }

  // -- INJECTORCONTRACT to INJECTORCONTRACT SIMPLE --
  public AtomicInjectorContractOutput toInjectorContractOutput(
      Optional<InjectorContract> injectorContract) {
    return injectorContract
        .map(
            contract ->
                AtomicInjectorContractOutput.builder()
                    .id(contract.getId())
                    .content(contract.getContent())
                    .convertedContent(contract.getConvertedContent())
                    .platforms(contract.getPlatforms())
                    .payload(toPayloadOutput(Optional.ofNullable(contract.getPayload()), contract))
                    .labels(contract.getLabels())
                    .build())
        .orElse(null);
  }

  private PayloadOutputDto toPayloadOutput(Optional<Payload> payload, InjectorContract injectorContract) {
    if (payload.isPresent()) {
      return payload
          .map(
              payloadToOutput -> {
                PayloadCommandBlockDto.PayloadCommandBlockDtoBuilder payloadCommandBlockBuilder = PayloadCommandBlockDto.builder();
                PayloadOutputDto.PayloadOutputDtoBuilder payloadOutput = PayloadOutputDto.builder()
                    .type(payloadToOutput.getType())
                    .collectorType(payloadToOutput.getCollectorType())
                    .name(payloadToOutput.getName())
                    .description(payloadToOutput.getDescription())
                    .platforms(payloadToOutput.getPlatforms())
                    .attackPatterns(toAttackPatternSimples(payloadToOutput.getAttackPatterns()))
                    .cleanupExecutor(payloadToOutput.getCleanupExecutor())
                    .arguments(payloadToOutput.getArguments())
                    .prerequisites(payloadToOutput.getPrerequisites())
                    .externalId(payloadToOutput.getExternalId())
                    .tags(payloadToOutput.getTags().stream().map(Tag::getId).collect(Collectors.toSet()));
                payloadCommandBlockBuilder.cleanupCommand(List.of(payloadToOutput.getCleanupCommand()));
                switch (payloadToOutput.getType()) {
                  case "Command":
                    Command command = (Command) payloadToOutput;
                    payloadCommandBlockBuilder.content(command.getContent());
                    payloadCommandBlockBuilder.executor(command.getExecutor());
                    break;
                  case "Executable":
                    assert payloadToOutput instanceof Executable;
                    Executable executable = (Executable) payloadToOutput;
                    payloadOutput.executableFile(executable.getExecutableFile());
                    payloadOutput.executableArch(executable.getExecutableArch());
                    break;
                  case "File":
                    assert payloadToOutput instanceof FileDrop;
                    FileDrop fileDrop = (FileDrop) payloadToOutput;
                    payloadOutput.fileDropFile(fileDrop.getFileDropFile());
                    break;
                  case "Dns":
                    assert payloadToOutput instanceof DnsResolution;
                    DnsResolution dnsResolution = (DnsResolution) payloadToOutput;
                    payloadOutput.hostname(dnsResolution.getHostname());
                    break;
                  case "Network":
                    assert payloadToOutput instanceof NetworkTraffic;
                    NetworkTraffic networkTraffic = (NetworkTraffic) payloadToOutput;
                    payloadOutput.portSrc(networkTraffic.getPortSrc());
                    payloadOutput.portDst(networkTraffic.getPortDst());
                    payloadOutput.protocol(networkTraffic.getProtocol());
                    payloadOutput.ipSrc(networkTraffic.getIpSrc());
                    payloadOutput.ipDst(networkTraffic.getIpDst());
                    break;
                }
                payloadOutput.payloadCommandBlock(payloadCommandBlockBuilder.build());
                return payloadOutput.build();
              })

          .orElse(null);
    } else {
      io.openbas.executors.Injector executor =
          context.getBean(
              injectorContract.getInjector().getType(), io.openbas.executors.Injector.class);
      return executor.getPayloadOutput(injectorContract.getId());
    }

  }

  // -- STATUS to STATUSIMPLE --
  public InjectStatusOutput toInjectStatusOutput(Optional<InjectStatus> injectStatus) {
    return injectStatus
        .map(
            status ->
                InjectStatusOutput.builder()
                    .id(status.getId())
                    .name(
                        Optional.ofNullable(status.getName())
                            .map(ExecutionStatus::name)
                            .orElse(null))
                    .traces(status.getTraces())
                    .trackingSentDate(status.getTrackingSentDate())
                    .trackingAckDate(status.getTrackingAckDate())
                    .trackingEndDate(status.getTrackingEndDate())
                    .trackingTotalExecutionTime(status.getTrackingTotalExecutionTime())
                    .trackingTotalCount(
                        Optional.ofNullable(status.getTrackingTotalCount()).orElse(0))
                    .trackingTotalError(status.getTrackingTotalError())
                    .trackingTotalSuccess(status.getTrackingTotalSuccess())
                    .build())
        .orElseGet(() -> InjectStatusOutput.builder().build());
  }

  // -- EXPECTATIONS to EXPECTATIONSIMPLE
  public List<InjectExpectationSimple> toInjectExpectationSimples(
      List<InjectExpectation> expectations) {
    return expectations.stream().filter(Objects::nonNull).map(this::toExpectationSimple).toList();
  }

  private InjectExpectationSimple toExpectationSimple(InjectExpectation expectation) {
    return InjectExpectationSimple.builder()
        .id(expectation.getId())
        .name(expectation.getName())
        .build();
  }

  // -- KILLCHAINPHASES to KILLCHAINPHASESSIMPLE
  public List<KillChainPhaseSimple> toKillChainPhasesSimples(List<KillChainPhase> killChainPhases) {
    return killChainPhases.stream()
        .filter(Objects::nonNull)
        .map(this::toKillChainPhasesSimple)
        .toList();
  }

  private KillChainPhaseSimple toKillChainPhasesSimple(KillChainPhase killChainPhase) {
    return KillChainPhaseSimple.builder()
        .id(killChainPhase.getId())
        .name(killChainPhase.getName())
        .build();
  }

  // -- ATTACKPATTERN to ATTACKPATTERNSIMPLE
  public List<AttackPatternSimpleDto> toAttackPatternSimples(List<AttackPattern> attackPatterns) {
    return attackPatterns.stream()
        .filter(Objects::nonNull)
        .map(this::toAttackPatternSimple)
        .toList();
  }

  private AttackPatternSimpleDto toAttackPatternSimple(AttackPattern attackPattern) {
    return AttackPatternSimpleDto.builder()
        .id(attackPattern.getId())
        .name(attackPattern.getName())
        .externalId(attackPattern.getExternalId())
        .build();
  }
}
