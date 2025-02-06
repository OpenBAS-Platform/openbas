package io.openbas.utils;

import io.openbas.database.model.*;
import io.openbas.rest.atomic_testing.form.*;
import io.openbas.rest.inject.output.InjectTestStatusOutput;
import java.util.*;
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
                    .payload(toPayloadSimple(Optional.ofNullable(contract.getPayload())))
                    .labels(contract.getLabels())
                    .build())
        .orElse(null);
  }

  private PayloadSimple toPayloadSimple(Optional<Payload> payload) {
    return payload
        .map(
            payloadToSimple ->
                PayloadSimple.builder()
                    .id(payloadToSimple.getId())
                    .type(payloadToSimple.getType())
                    .collectorType(payloadToSimple.getCollectorType())
                    .build())
        .orElse(null);
  }

  // -- STATUS to STATUSIMPLE --
  private <T extends InjectStatusOutput> T buildInjectStatusOutput(
      T output, BaseInjectStatus status, List<ExecutionTraces> executionTraces) {
    output.setId(status.getId());
    output.setName(String.valueOf(status.getName()));
    output.setTraces(
        toExecutionTracesOutput(
            executionTraces.stream().filter(trace -> trace.getAgent() == null).toList()));
    output.setTracesByAgent(
        groupTracesByAgent(
            executionTraces.stream().filter(trace -> trace.getAgent() != null).toList()));
    output.setTrackingSentDate(status.getTrackingSentDate());
    output.setTrackingEndDate(status.getTrackingEndDate());
    return output;
  }

  public InjectStatusOutput toInjectStatusOutput(Optional<InjectStatus> injectStatus) {
    return injectStatus
        .map(
            status ->
                this.<InjectStatusOutput>buildInjectStatusOutput(
                    InjectStatusOutput.builder().build(), status, status.getTraces()))
        .orElseGet(() -> InjectStatusOutput.builder().build());
  }

  public InjectTestStatusOutput toInjectTestStatusOutput(InjectTestStatus injectTestStatus) {
    InjectTestStatusOutput output = InjectTestStatusOutput.builder().build();
    buildInjectStatusOutput(output, injectTestStatus, injectTestStatus.getTraces());

    output.setInjectId(injectTestStatus.getInject().getId());
    output.setInjectType(
        injectTestStatus
            .getInject()
            .getInjectorContract()
            .map(InjectorContract::getInjector)
            .map(Injector::getType)
            .orElse(null));
    output.setInjectTitle(injectTestStatus.getInject().getTitle());

    return output;
  }

  public List<ExecutionTracesOutput> toExecutionTracesOutput(List<ExecutionTraces> traces) {
    return traces.stream()
        .map(
            trace ->
                ExecutionTracesOutput.builder()
                    .status(trace.getStatus())
                    .time(trace.getTime())
                    .message(trace.getMessage())
                    .action(trace.getAction())
                    .build())
        .toList();
  }

  private List<AgentStatusOutput> groupTracesByAgent(List<ExecutionTraces> traces) {
    return traces.stream()
        .collect(Collectors.groupingBy(ExecutionTraces::getAgent))
        .entrySet()
        .stream()
        .map(
            entry -> {
              ExecutionTraces finalTrace =
                  entry.getValue().stream()
                      .filter(t -> t.getAction() == ExecutionTraceAction.COMPLETE)
                      .findFirst()
                      .orElse(null);
              Agent agent = entry.getKey();
              return AgentStatusOutput.builder()
                  .assetId(agent.getAsset().getId())
                  .agentId(agent.getId())
                  .agentExecutorName(agent.getExecutor().getName())
                  .agentExecutorType(agent.getExecutor().getType())
                  .agentName(agent.getExecutedByUser())
                  .statusName(finalTrace != null ? String.valueOf(finalTrace.getStatus()) : null)
                  .trackingEndDate(finalTrace != null ? finalTrace.getTime() : null)
                  .trackingSentDate(
                      entry.getValue().stream()
                          .filter(t -> t.getAction() == ExecutionTraceAction.START)
                          .findFirst()
                          .map(ExecutionTraces::getTime)
                          .orElse(null))
                  .agentTraces(toExecutionTracesOutput(entry.getValue()))
                  .build();
            })
        .toList();
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
