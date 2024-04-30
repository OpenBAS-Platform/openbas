package io.openbas.atomic_testing;

import static io.openbas.atomic_testing.AtomicTestingUtils.getRefinedExpectations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.atomic_testing.form.AtomicTestingDetailOutput;
import io.openbas.atomic_testing.form.AtomicTestingOutput;
import io.openbas.atomic_testing.form.AtomicTestingOutput.AtomicTestingOutputBuilder;
import io.openbas.atomic_testing.form.InjectTargetWithResult;
import io.openbas.atomic_testing.form.ExpectationResultOutput;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.Tag;
import io.openbas.model.inject.form.Expectation;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class AtomicTestingMapper {

  public static AtomicTestingOutput toDtoWithTargetResults(Inject inject) {
    List<InjectTargetWithResult> targets = AtomicTestingUtils.getTargetsWithResults(inject);
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

    return getAtomicTestingOutputBuilder(inject)
        .targets(targets)
        .expectationResultByTypes(AtomicTestingUtils.getExpectationResultByTypes(
            getRefinedExpectations(inject, targetIds)
        ))
        .build();
  }

  public static AtomicTestingOutput toDto(Inject inject) {
    List<InjectTargetWithResult> targets = AtomicTestingUtils.getTargets(inject);
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

    return getAtomicTestingOutputBuilder(inject)
        .targets(targets)
        .expectationResultByTypes(AtomicTestingUtils.getExpectationResultByTypes(
            getRefinedExpectations(inject, targetIds)
        ))
        .build();
  }

  private static AtomicTestingOutputBuilder getAtomicTestingOutputBuilder(Inject inject) {
    return AtomicTestingOutput
        .builder()
        .id(inject.getId())
        .title(inject.getTitle())
        .type(inject.getType())
        .tagIds(inject.getTags().stream().map(Tag::getId).toList())
        .injectorContract(inject.getInjectorContract())
        .lastExecutionStartDate(inject.getStatus().map(InjectStatus::getTrackingSentDate).orElse(null))
        .lastExecutionEndDate(inject.getStatus().map(InjectStatus::getTrackingSentDate).orElse(null))
        .status(inject.getStatus().map(InjectStatus::getName).orElse(ExecutionStatus.DRAFT));
  }

  public static ExpectationResultOutput toTargetResultDto(InjectExpectation injectExpectation,
      final String targetId) {
    return ExpectationResultOutput
        .builder()
        .id(injectExpectation.getId())
        .injectId(injectExpectation.getInject().getId())
        .type(ExpectationType.of(injectExpectation.getType().name()))
        .targetId(targetId)
        .subtype(injectExpectation.getType().name())
        .startedAt(injectExpectation.getCreatedAt())
        .endedAt(injectExpectation.getUpdatedAt())
        .results(injectExpectation.getResults())
        .response(injectExpectation.getScore() == null ? ExpectationStatus.PENDING
            : (injectExpectation.getScore() == 0 ? ExpectationStatus.FAILED : ExpectationStatus.VALIDATED))
        .build();
  }

  public static AtomicTestingDetailOutput toDetailDto(Inject inject) {
    return inject.getStatus().map(status ->
        AtomicTestingDetailOutput
            .builder()
            .atomicId(inject.getId())
            .description(inject.getDescription())
            .content(inject.getContent())
            .expectations(getAtomicTestingExpectations(inject.getContent()))
            .tags(inject.getTags())
            .documents(inject.getDocuments())
            .status(status.getName())
            .traces(status.getTraces().stream().map(trace -> trace.getStatus() + " " + trace.getMessage())
                .collect(Collectors.toList()))
            .trackingAckDate(status.getTrackingAckDate())
            .trackingSentDate(status.getTrackingSentDate())
            .trackingEndDate(status.getTrackingEndDate())
            .trackingTotalCount(status.getTrackingTotalCount())
            .trackingTotalError(status.getTrackingTotalError())
            .trackingTotalSuccess(status.getTrackingTotalSuccess())
            .build()
    ).orElse(AtomicTestingDetailOutput.builder().status(ExecutionStatus.DRAFT).build());

  }

  @SuppressWarnings("unchecked")
  public static List<Expectation> getAtomicTestingExpectations(ObjectNode content) {
    ObjectMapper mapper = new ObjectMapper();
    try {
      return mapper.treeToValue(content.get("expectations"), List.class);
    } catch (JsonProcessingException e) {
      return Collections.emptyList();
    }
  }

  public record ExpectationResultsByType(@NotNull ExpectationType type, @NotNull ExpectationStatus avgResult,
                                         @NotNull List<ResultDistribution> distribution) {

  }

  public record ResultDistribution(@NotNull String label, @NotNull Integer value) {

  }

}
