package io.openbas.utils;

import io.openbas.atomic_testing.TargetType;
import io.openbas.database.model.*;
import io.openbas.rest.atomic_testing.form.*;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InjectMapper {

  private final InjectUtils injectUtils;
  private final ResultUtils resultUtils;

  public InjectResultOverviewOutput toDto(Inject inject) {
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
        .commandsLines(injectUtils.getCommandsLinesFromInject(inject))
        .type(injectorContract.map(contract -> contract.getInjector().getType()).orElse(null))
        .tagIds(inject.getTags().stream().map(Tag::getId).toList())
        .documentIds(documentIds)
        .injectorContract(toInjectorContractSimple(injectorContract))
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
    return targets.stream().map(target -> toTargetSimple(target, type)).toList();
  }

  public TargetSimple toTargetSimple(Object[] target, TargetType type) {
    return TargetSimple.builder()
        .id((String) target[1])
        .name((String) target[2])
        .type(type)
        .build();
  }

  // -- INJECTORCONTRACT to INJECTORCONTRACT SIMPLE --
  public InjectorContractSimple toInjectorContractSimple(
      Optional<InjectorContract> injectorContract) {
    return injectorContract
        .map(
            contract ->
                InjectorContractSimple.builder()
                    .id(contract.getId())
                    .content(contract.getContent())
                    .convertedContent(contract.getConvertedContent())
                    .platforms(contract.getPlatforms())
                    .payload(toPayloadSimple(contract.getPayload()))
                    .labels(contract.getLabels())
                    .build())
        .orElse(null);
  }

  private PayloadSimple toPayloadSimple(Payload payload) {
    return PayloadSimple.builder()
        .id(payload.getId())
        .type(payload.getType())
        .collectorType(payload.getCollectorType())
        .build();
  }

  // -- STATUS to STATUSIMPLE --
  public InjectStatusOutput toInjectStatusOutput(Optional<InjectStatus> injectStatus) {
    return injectStatus
        .map(
            status -> {
              InjectStatusOutput.InjectStatusOutputBuilder builder =
                  InjectStatusOutput.builder()
                      .id(status.getId())
                      .name(
                          Optional.ofNullable(status.getName())
                              .map(ExecutionStatus::name)
                              .orElse(ExecutionStatus.DRAFT.name()))
                      .trackingSentDate(status.getTrackingSentDate())
                      .trackingAckDate(status.getTrackingAckDate())
                      .trackingEndDate(status.getTrackingEndDate())
                      .trackingTotalExecutionTime(status.getTrackingTotalExecutionTime())
                      .trackingTotalCount(status.getTrackingTotalCount())
                      .trackingTotalError(status.getTrackingTotalError())
                      .trackingTotalSuccess(status.getTrackingTotalSuccess());

              return builder.build();
            })
        .orElseGet(
            () -> {
              return InjectStatusOutput.builder()
                  .id(null)
                  .name(ExecutionStatus.DRAFT.name())
                  .trackingSentDate(null)
                  .build();
            });
  }

  // -- EXPECTATIONS to EXPECTATIONSIMPLE
  public List<InjectExpectationSimple> toInjectExpectationSimples(
      List<InjectExpectation> expectations) {
    return expectations.stream().map(expectation -> toExpectationSimple(expectation)).toList();
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
        .map(killChainPhase -> toKillChainPhasesSimple(killChainPhase))
        .toList();
  }

  private KillChainPhaseSimple toKillChainPhasesSimple(KillChainPhase killChainPhase) {
    return KillChainPhaseSimple.builder()
        .id(killChainPhase.getId())
        .name(killChainPhase.getName())
        .build();
  }

  // -- ATTACKPATTERN to ATTACKPATTERNSIMPLE
  public List<AttackPatternSimple> toAttackPatternSimples(List<AttackPattern> attackPatterns) {
    return attackPatterns.stream()
        .map(attackPattern -> toAttackPatternSimple(attackPattern))
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
