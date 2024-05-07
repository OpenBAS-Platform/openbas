package io.openbas.utils;

import io.openbas.database.model.*;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.AtomicTestingDetailOutput;
import io.openbas.rest.atomic_testing.form.InjectResultDTO;
import io.openbas.rest.atomic_testing.form.InjectResultDTO.InjectResultDTOBuilder;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.stream.Collectors;

import static io.openbas.database.model.InjectStatus.draftInjectStatus;
import static io.openbas.utils.AtomicTestingUtils.getRefinedExpectations;

public class AtomicTestingMapper {

  public static InjectResultDTO toDtoWithTargetResults(Inject inject) {
    List<InjectTargetWithResult> targets = AtomicTestingUtils.getTargetsWithResults(inject);
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

    return getAtomicTestingOutputBuilder(inject)
        .targets(targets)
        .expectationResultByTypes(AtomicTestingUtils.getExpectationResultByTypes(
            getRefinedExpectations(inject, targetIds)
        ))
        .build();
  }

  public static InjectResultDTO toDto(Inject inject, List<InjectTargetWithResult> targets) {
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

    return getAtomicTestingOutputBuilder(inject)
        .targets(targets)
        .expectationResultByTypes(AtomicTestingUtils.getExpectationResultByTypes(
            getRefinedExpectations(inject, targetIds)
        ))
        .build();
  }

  private static InjectResultDTOBuilder getAtomicTestingOutputBuilder(Inject inject) {
    return InjectResultDTO
        .builder()
        .id(inject.getId())
        .title(inject.getTitle())
        .description(inject.getDescription())
        .type(inject.getType())
        .tagIds(inject.getTags().stream().map(Tag::getId).toList())
        .injectorContract(inject.getInjectorContract())
        .status(inject.getStatus().orElse(draftInjectStatus()))
        .killChainPhases(inject.getKillChainPhases())
        .attackPatterns(inject.getAttackPatterns())
        .updatedAt(inject.getUpdatedAt());
  }

  public static AtomicTestingDetailOutput toDetailDto(Inject inject) {
    AtomicTestingDetailOutput.AtomicTestingDetailOutputBuilder atomicTestingDetailOutputBuilder = AtomicTestingDetailOutput
        .builder()
        .atomicId(inject.getId())
        .description(inject.getDescription())
        .content(inject.getContent())
        .expectations(inject.getExpectations())
        .tags(inject.getTags())
        .documents(inject.getDocuments())
        .injectorLabel(inject.getInjectorContract().getLabels());

    if (inject.getStatus().isPresent()) {
      InjectStatus injectStatus = inject.getStatus().get();
      atomicTestingDetailOutputBuilder
          .status(injectStatus.getName())
          .traces(injectStatus.getTraces().stream().map(trace -> trace.getStatus() + " " + trace.getMessage())
              .collect(Collectors.toList()))
          .trackingAckDate(injectStatus.getTrackingAckDate())
          .trackingSentDate(injectStatus.getTrackingSentDate())
          .trackingEndDate(injectStatus.getTrackingEndDate())
          .trackingTotalCount(injectStatus.getTrackingTotalCount())
          .trackingTotalError(injectStatus.getTrackingTotalError())
          .trackingTotalSuccess(injectStatus.getTrackingTotalSuccess());
    } else {
      atomicTestingDetailOutputBuilder.status(ExecutionStatus.DRAFT);
    }
    return atomicTestingDetailOutputBuilder.build();
  }

  public record ExpectationResultsByType(@NotNull ExpectationType type,
                                         @NotNull InjectExpectation.ExpectationStatus avgResult,
                                         @NotNull List<ResultDistribution> distribution) {

  }

  public record ResultDistribution(@NotNull String label, @NotNull Integer value) {

  }

}
