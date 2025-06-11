package io.openbas.utils;

import io.openbas.database.model.*;
import io.openbas.rest.atomic_testing.form.*;
import io.openbas.rest.inject.output.InjectTestExecutionOutput;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InjectExecutionMapper {

  private final AgentMapper agentMapper;

  public InjectExecutionOutput toInjectExecutionOutput(Optional<InjectExecution> injectExecution) {
    return injectExecution
        .map(
            status ->
                this.<InjectExecutionOutput>buildInjectExecutionOutput(
                    InjectExecutionOutput.builder().build(), status, status.getTraces()))
        .orElseGet(() -> InjectExecutionOutput.builder().build());
  }

  public InjectTestExecutionOutput toInjectTestExecutionOutput(InjectTestExecution injectTestExecution) {
    InjectTestExecutionOutput output = InjectTestExecutionOutput.builder().build();
    buildInjectExecutionOutput(output, injectTestExecution, injectTestExecution.getTraces());

    output.setInjectId(injectTestExecution.getInject().getId());
    output.setInjectType(
        injectTestExecution
            .getInject()
            .getInjectorContract()
            .map(InjectorContract::getInjector)
            .map(Injector::getType)
            .orElse(null));
    output.setInjectTitle(injectTestExecution.getInject().getTitle());

    return output;
  }

  private <T extends InjectExecutionOutput> T buildInjectExecutionOutput(
      T output, BaseInjectExecution status, List<ExecutionTrace> executionTraces) {
    output.setId(status.getId());
    output.setName(status.getName().name());
    output.setTraces(
        toExecutionTracesOutput(
            executionTraces.stream()
                .filter(trace -> trace.getAgent() == null && trace.getIdentifiers().isEmpty())
                .toList()));
    output.setTrackingSentDate(status.getTrackingSentDate());
    output.setTrackingEndDate(status.getTrackingEndDate());
    return output;
  }

  public InjectExecutionSimple toInjectExecutionSimple(Optional<InjectExecution> injectExecution) {
    return injectExecution
        .map(
            status ->
                InjectExecutionSimple.builder()
                    .id(status.getId())
                    .name(status.getName().name())
                    .trackingSentDate(status.getTrackingSentDate())
                    .trackingEndDate(status.getTrackingEndDate())
                    .build())
        .orElseGet(() -> InjectExecutionSimple.builder().build());
  }

  public List<ExecutionTraceOutput> toExecutionTracesOutput(List<ExecutionTrace> traces) {
    return traces.stream()
        .map(
            trace ->
                ExecutionTraceOutput.builder()
                    .status(trace.getStatus())
                    .time(trace.getTime())
                    .message(trace.getMessage())
                    .action(trace.getAction())
                    .agent(
                        trace.getAgent() != null
                            ? agentMapper.toAgentOutput(trace.getAgent())
                            : null)
                    .build())
        .toList();
  }
}
